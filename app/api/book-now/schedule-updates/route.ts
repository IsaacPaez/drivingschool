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
  
  // Heartbeat to keep the connection alive on serverless hosts (e.g., Vercel)
  // Sends a small ping every 15 seconds so intermediaries don't close the stream
  let heartbeat: ReturnType<typeof setInterval> | null = setInterval(() => {
    try {
      writer.write(encoder.encode(`: ping\n\n`));
    } catch {
      // Ignore, connection likely closed
    }
  }, 15000);
  
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
    
    // Filter schedule to only include driving test slots
    const fullSchedule = instructor.get('schedule_driving_test', { lean: true }) || [];
    // console.log(`📊 Instructor ${instructorId} (${instructor.name}): Found ${fullSchedule.length} schedule_driving_test slots`);
    
    // if (fullSchedule.length > 0) {
    //   console.log("📅 Sample slots:", fullSchedule.slice(0, 3).map(s => ({ 
    //     date: s.date, 
    //     start: s.start, 
    //     end: s.end, 
    //     status: s.status,
    //     classType: s.classType 
    //   })));
    // }
    
    sendEvent({ type: "initial", schedule: fullSchedule });
  } catch (error) {
    console.error("Error fetching initial schedule:", error);
    sendEvent({ type: "error", message: "Failed to fetch initial data" });
  }

  // Setup Change Stream with error handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let changeStream: any = null;
  try {
    changeStream = mongoose.connection.collection('instructors').watch([
      { $match: { 'documentKey._id': new mongoose.Types.ObjectId(instructorId) } }
    ]);

    changeStream.on('change', async () => {
      try {
        console.log(`🔄 Change detected for instructor ${instructorId}`);
        const instructor = await Instructor.findById(instructorId);
        if (instructor) {
          // Get schedule_driving_test slots
          const updatedSchedule = instructor.get('schedule_driving_test', { lean: true }) || [];
          
          console.log(`🔄 Updated schedule for ${instructorId}: ${updatedSchedule.length} driving test slots`);
          sendEvent({ type: "update", schedule: updatedSchedule });
        }
      } catch(err) {
        console.error("Error fetching updated schedule for broadcast:", err);
        sendEvent({ type: "error", message: "Failed to fetch updated data" });
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
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
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
      // Allow the Vercel preview/production domains
      'Access-Control-Allow-Origin': '*',
    },
  });
} 