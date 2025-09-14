import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

// Type for SSE event data
interface SSEEvent {
  type: string;
  message?: string;
  schedule?: unknown[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("id");

  if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
    return new Response(JSON.stringify({ error: "Invalid instructor ID" }), { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: SSEEvent) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
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

  // Send initial data
  try {
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      console.log(`❌ Instructor not found: ${instructorId}`);
      sendEvent({ type: "error", message: "Instructor not found" });
      writer.close();
      return new Response(stream.readable, { status: 404 });
    }
    
    // Get both driving lessons and driving tests
    const drivingLessons = instructor.get('schedule_driving_lesson', { lean: true }) || [];
    const drivingTests = instructor.get('schedule_driving_test', { lean: true }) || [];
    
    // Combine both schedules
    const fullSchedule = [...drivingLessons, ...drivingTests];
    
    console.log(`📊 Instructor ${instructorId} (${instructor.name}): Found ${drivingLessons.length} driving lessons + ${drivingTests.length} driving tests = ${fullSchedule.length} total slots`);
    
    if (fullSchedule.length > 0) {
      console.log("📅 Sample slots:", fullSchedule.slice(0, 3).map(s => ({ 
        date: s.date, 
        start: s.start, 
        end: s.end, 
        status: s.status,
        classType: s.classType || 'driving_lesson'
      })));
    }
    
    sendEvent({ type: "initial", schedule: fullSchedule });
  } catch (error) {
    console.error("Error fetching initial driving lessons schedule:", error);
    sendEvent({ type: "error", message: "Failed to fetch initial data" });
  }

  // Setup Change Stream with error handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let changeStream: any = null;
  let updateTimeout: NodeJS.Timeout | null = null;
  let lastUpdateTime = 0;
  const UPDATE_THROTTLE_MS = 1000; // Only send updates every 1 second max
  
  try {
    changeStream = mongoose.connection.collection('instructors').watch([
      { $match: { 'documentKey._id': new mongoose.Types.ObjectId(instructorId) } }
    ]);

    changeStream.on('change', async () => {
      try {
        const now = Date.now();
        
        // Clear existing timeout
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        
        // If enough time has passed since last update, send immediately
        if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
          await sendUpdate();
        } else {
          // Otherwise, debounce the update
          updateTimeout = setTimeout(async () => {
            await sendUpdate();
          }, UPDATE_THROTTLE_MS - (now - lastUpdateTime));
        }
        
        async function sendUpdate() {
          try {
            console.log(`🔄 Change detected for instructor ${instructorId} - sending update`);
            const instructor = await Instructor.findById(instructorId);
            if (instructor) {
              // Get both driving lessons and driving tests
              const drivingLessons = instructor.get('schedule_driving_lesson', { lean: true }) || [];
              const drivingTests = instructor.get('schedule_driving_test', { lean: true }) || [];
              
              // Combine both schedules
              const updatedSchedule = [...drivingLessons, ...drivingTests];
              
              console.log(`🔄 Updated schedule for ${instructorId}: ${drivingLessons.length} driving lessons + ${drivingTests.length} driving tests = ${updatedSchedule.length} total slots`);
              sendEvent({ type: "update", schedule: updatedSchedule });
              lastUpdateTime = Date.now();
            }
          } catch(err) {
            console.error("Error fetching updated driving lessons schedule for broadcast:", err);
            sendEvent({ type: "error", message: "Failed to fetch updated data" });
          }
        }
      } catch(err) {
        console.error("Error in change stream handler:", err);
        sendEvent({ type: "error", message: "Failed to process change" });
      }
    });

    changeStream.on('error', (error: Error) => {
      console.error("Change stream error:", error);
      sendEvent({ type: "error", message: "Database change stream error" });
    });

  } catch (error) {
    console.error("Failed to setup change stream:", error);
    sendEvent({ type: "error", message: "Failed to setup real-time updates" });
  }

  // Handle client disconnect
  req.signal.addEventListener('abort', () => {
    if (changeStream) {
      changeStream.close();
    }
    if (updateTimeout) {
      clearTimeout(updateTimeout);
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