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
  ticketClasses?: any[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId");
  const classType = searchParams.get("type");

  if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
    return new Response(JSON.stringify({ error: "Invalid instructor ID" }), { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: SSEEvent) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      console.warn("SSE stream closed prematurely.");
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
      // Build query to find ticket classes directly by instructorId
      let query: any = {
        instructorId: instructorId
      };
      
      // Filter by class type if specified
      if (classType && classType !== 'ALL') {
        // Convert frontend format to database format
        let dbClassType = classType.toLowerCase();
        if (classType === 'A.D.I') dbClassType = 'adi';
        if (classType === 'B.D.I') dbClassType = 'bdi';
        if (classType === 'D.A.T.E') dbClassType = 'date';
        
        query.type = dbClassType;
      }

      const ticketClasses = await TicketClass.find(query).lean();
      
      // Populate class info for each ticket class
      const ticketClassesWithInfo = await Promise.all(
        ticketClasses.map(async (tc: any) => {
          // Get instructor info to access their schedule
          const instructor = await Instructor.findById(tc.instructorId).lean() as any;
          
          // Get class info using classId
          const classInfo = await Classes.findById(tc.classId).lean() as any;
          
          // Find the status by looking for this ticketClassId in instructor's schedule
          let status = 'available';
          let availableSpots = tc.cupos || 0;
          
          if (instructor?.schedule) {
            // Search through instructor's schedule to find this ticket class
            for (const daySchedule of instructor.schedule) {
              if (daySchedule.slots) {
                const slot = daySchedule.slots.find((slot: any) => 
                  slot.ticketClassId && slot.ticketClassId.toString() === tc._id.toString()
                );
                if (slot) {
                  status = slot.status || 'available';
                  break;
                }
              }
            }
          }
          
          // Calculate enrolled students and available spots
          const enrolledStudents = tc.students ? tc.students.length : 0;
          const totalSpots = tc.cupos || 0;
          availableSpots = totalSpots - enrolledStudents;
          
          return {
            ...tc,
            status,
            availableSpots,
            enrolledStudents,
            totalSpots,
            endHour: tc.endHour,
            classInfo: classInfo ? {
              _id: classInfo._id,
              title: classInfo.title,
              overview: classInfo.overview
            } : null,
            instructorInfo: instructor ? {
              _id: instructor._id,
              name: instructor.name,
              email: instructor.email,
              photo: instructor.photo
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
  let ticketClassChangeStream: any = null;
  let instructorChangeStream: any = null;
  
  try {
    // Watch for changes in TicketClass collection for this instructor
    ticketClassChangeStream = mongoose.connection.collection('ticketclasses').watch([
      { $match: { 'fullDocument.instructorId': new mongoose.Types.ObjectId(instructorId) } }
    ]);

    ticketClassChangeStream.on('change', async () => {
      console.log('🔔 TicketClass change detected!');
      try {
        const ticketClasses = await fetchTicketClasses();
        sendEvent({ type: "update", ticketClasses });
      } catch(err) {
        console.error("Error fetching updated ticket classes:", err);
        sendEvent({ type: "error", message: "Failed to fetch updated data" });
      }
    });

    // Watch for changes in Instructor collection (for schedule updates)
    instructorChangeStream = mongoose.connection.collection('instructors').watch([
      { $match: { 'documentKey._id': new mongoose.Types.ObjectId(instructorId) } }
    ]);

    instructorChangeStream.on('change', async () => {
      console.log('🔔 Instructor change detected!');
      try {
        const ticketClasses = await fetchTicketClasses();
        sendEvent({ type: "update", ticketClasses });
      } catch(err) {
        console.error("Error fetching updated ticket classes after instructor change:", err);
        sendEvent({ type: "error", message: "Failed to fetch updated data" });
      }
    });

  } catch (error) {
    console.error("Failed to setup change streams:", error);
    sendEvent({ type: "error", message: "Failed to setup real-time updates" });
  }

  // --- Fallback: Emit update every 2 seconds if there are clients connected ---
  let intervalId: NodeJS.Timeout | null = null;
  intervalId = setInterval(async () => {
    try {
      const ticketClasses = await fetchTicketClasses();
      sendEvent({ type: "update", ticketClasses });
    } catch (err) {
      // Silenciar errores de polling
    }
  }, 2000);

  // Handle client disconnect
  req.signal.addEventListener('abort', () => {
    if (ticketClassChangeStream) {
      ticketClassChangeStream.close();
    }
    if (instructorChangeStream) {
      instructorChangeStream.close();
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
    writer.close().catch((err) => {
      console.warn("Error closing SSE writer:", err);
    });
  });
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
