import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import Instructor from "@/models/Instructor";
import Classes from "@/models/Classes";
import mongoose from "mongoose";

// Type for SSE event data
interface SSEEvent {
  type: string;
  message?: string;
  ticketClasses?: unknown[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId");
  const classType = searchParams.get("type");
  const classId = searchParams.get("classId");
  const userId = searchParams.get("userId"); // Get userId to check user's requests

  // If we have classId, we don't require instructorId validation
  if (!classId && (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId))) {
    return new Response(JSON.stringify({ error: "Invalid instructor ID" }), { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  let isStreamClosed = false;

  const sendEvent = (data: SSEEvent) => {
    if (isStreamClosed) {
      return; // Don't try to write to closed stream
    }
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (error) {
      console.warn("SSE stream closed prematurely:", error);
      isStreamClosed = true;
    }
  };
  
  // Connect to the database
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to DB for SSE:", error);
    sendEvent({ type: "error", message: "Database connection failed" });
    writer.close();
    return new Response(stream.readable, { status: 500 });
  }

  // Function to fetch and process ticket classes
  const fetchTicketClasses = async () => {
    try {
      // Build query to find ticket classes
      const query: Record<string, unknown> = {};
      
      // Filter by classId if specified (priority over everything else)
      if (classId && mongoose.Types.ObjectId.isValid(classId)) {
        query.classId = classId;
        // If instructorId is also specified, add it to the filter
        if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
          query.instructorId = instructorId;
        }
      } else if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
        // Original logic for instructor-based filtering
        query.instructorId = instructorId;
        
        if (classType && classType !== 'ALL') {
          // Convert frontend format to database format
          let dbClassType = classType.toLowerCase();
          if (classType === 'A.D.I') dbClassType = 'adi';
          if (classType === 'B.D.I') dbClassType = 'bdi';
          if (classType === 'D.A.T.E') dbClassType = 'date';
          
          query.type = dbClassType;
        }
      } else {
        // If no valid filters, return empty array
        return [];
      }

      const ticketClasses = await TicketClass.find(query).lean();
      
      // Populate class info for each ticket class
      const ticketClassesWithInfo = await Promise.all(
        ticketClasses.map(async (tc: Record<string, unknown>) => {
          // Get instructor info to access their schedule
          const instructor = await Instructor.findById(tc.instructorId).lean() as Record<string, unknown>;
          
          // Get class info using classId
          const classInfo = await Classes.findById(tc.classId).lean() as Record<string, unknown>;
          
          // Find the status by looking for this ticketClassId in instructor's schedule
          let status = 'available';  // Default to available
          
          if (instructor?.schedule) {
            // Search through instructor's schedule to find this ticket class
            const schedule = instructor.schedule as Record<string, unknown>[];
            for (const daySchedule of schedule) {
              if (daySchedule.slots) {
                const slots = daySchedule.slots as Record<string, unknown>[];
                const slot = slots.find((slot: Record<string, unknown>) => 
                  slot.ticketClassId && slot.ticketClassId.toString() === tc._id?.toString()
                );
                if (slot) {
                  status = (slot.status as string) || 'available';
                  break;
                }
              }
            }
          }
          
          // Calculate enrolled students and available spots
          const students = tc.students as unknown[] || [];
          const enrolledStudents = Array.isArray(students) ? students.length : 0;
          
          // Handle both field names: 'cupos' from model and 'spots' from database
          const totalSpots = (tc.cupos as number) || (tc.spots as number) || 0;
          const availableSpots = Math.max(0, totalSpots - enrolledStudents);
          
          // Check if current user has a pending request for this class
          const studentRequests = tc.studentRequests as Array<{
            studentId: string;
            requestDate: string;
            status: string;
          }> || [];
          
          const userHasPendingRequest = userId && studentRequests.some(
            request => request.studentId.toString() === userId && request.status === 'pending'
          );
          
          // Check if user is already enrolled
          const userIsEnrolled = userId && students.some(
            (student: unknown) => {
              if (typeof student === 'object' && student !== null && 'studentId' in student) {
                const studentObj = student as { studentId: unknown };
                return studentObj.studentId?.toString() === userId;
              }
              return false;
            }
          );
          
          // Force status to available if there are spots and no students
          if (availableSpots > 0 && enrolledStudents === 0) {
            status = 'available';
          }
          
          return {
            ...tc,
            status,
            availableSpots,
            enrolledStudents,
            totalSpots,
            endHour: tc.endHour,
            userHasPendingRequest,
            userIsEnrolled,
            classInfo: classInfo ? {
              _id: classInfo._id,
              title: classInfo.title as string,
              overview: classInfo.overview as string
            } : null,
            instructorInfo: instructor ? {
              _id: instructor._id,
              name: instructor.name as string,
              email: instructor.email as string,
              photo: instructor.photo as string
            } : null
          };
        })
      );
      
      return ticketClassesWithInfo;
    } catch (error) {
      console.error("Error fetching ticket classes:", error);
      return [];
    }
  };

  // Send initial data
  try {
    const ticketClasses = await fetchTicketClasses();
    sendEvent({ type: "initial", ticketClasses });
  } catch (error) {
    console.error("Error fetching initial ticket classes:", error);
    sendEvent({ type: "error", message: "Failed to fetch initial data" });
  }

  // Setup Change Stream for TicketClass collection
  let ticketClassChangeStream: unknown = null;
  let instructorChangeStream: unknown = null;
  
  try {
    // Watch for changes in TicketClass collection
    if (classId) {
      // If filtering by classId, watch for changes in any ticket class with this classId
      ticketClassChangeStream = mongoose.connection.collection('ticketclasses').watch([
        { $match: { 'fullDocument.classId': new mongoose.Types.ObjectId(classId) } }
      ]);
    } else if (instructorId) {
      // If filtering by instructorId, watch for changes for this instructor
      ticketClassChangeStream = mongoose.connection.collection('ticketclasses').watch([
        { $match: { 'fullDocument.instructorId': new mongoose.Types.ObjectId(instructorId) } }
      ]);
    }

    if (ticketClassChangeStream) {
      (ticketClassChangeStream as unknown as { on: (event: string, callback: () => void) => void }).on('change', async () => {
        if (isStreamClosed) return;
        
        console.log('🔔 TicketClass change detected!');
        try {
          const ticketClasses = await fetchTicketClasses();
          sendEvent({ type: "update", ticketClasses });
        } catch(error) {
          console.error("Error fetching updated ticket classes:", error);
          if (!isStreamClosed) {
            sendEvent({ type: "error", message: "Failed to fetch updated data" });
          }
        }
      });
    }

    // Watch for changes in Instructor collection (for schedule updates) - only if we have instructorId
    if (instructorId) {
      instructorChangeStream = mongoose.connection.collection('instructors').watch([
        { $match: { 'documentKey._id': new mongoose.Types.ObjectId(instructorId) } }
      ]);

      (instructorChangeStream as unknown as { on: (event: string, callback: () => void) => void }).on('change', async () => {
        if (isStreamClosed) return;
        
        console.log('🔔 Instructor change detected!');
        try {
          const ticketClasses = await fetchTicketClasses();
          sendEvent({ type: "update", ticketClasses });
        } catch(error) {
          console.error("Error fetching updated ticket classes after instructor change:", error);
          if (!isStreamClosed) {
            sendEvent({ type: "error", message: "Failed to fetch updated data" });
          }
        }
      });
    }

  } catch (error) {
    console.error("Failed to setup change streams:", error);
    sendEvent({ type: "error", message: "Failed to setup real-time updates" });
  }

  // Polling eliminado - solo usamos change streams de MongoDB para actualizaciones en tiempo real

  // Handle client disconnect
  req.signal.addEventListener('abort', () => {
    console.log('🔌 SSE client disconnected');
    isStreamClosed = true;
    
    if (ticketClassChangeStream && typeof ticketClassChangeStream === 'object' && 'close' in ticketClassChangeStream) {
      (ticketClassChangeStream as { close: () => void }).close();
    }
    if (instructorChangeStream && typeof instructorChangeStream === 'object' && 'close' in instructorChangeStream) {
      (instructorChangeStream as { close: () => void }).close();
    }
    
    if (!isStreamClosed) {
      writer.close().catch((error) => {
        console.warn("Error closing SSE writer:", error);
      });
    }
  });
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
