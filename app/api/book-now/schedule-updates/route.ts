import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

// Type for SSE event data
interface SSEEvent {
  type: string;
  message?: string;
  schedule?: any[];
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
    const fullSchedule = instructor.get('schedule', { lean: true }) || [];
    const drivingTestSchedule = fullSchedule.filter((slot: any) => slot.classType === "driving test");
    
    console.log(`📊 Instructor ${instructorId}: ${fullSchedule.length} total slots, ${drivingTestSchedule.length} driving test slots`);
    
    if (drivingTestSchedule.length > 0) {
      console.log(`✅ Found ${drivingTestSchedule.length} driving test slots for instructor ${instructorId}`);
      console.log("📅 Sample slots:", drivingTestSchedule.slice(0, 3).map(s => ({ date: s.date, start: s.start, end: s.end, status: s.status })));
    } else {
      console.log(`⚠️ No driving test slots found for instructor ${instructorId}`);
    }
    sendEvent({ type: "initial", schedule: drivingTestSchedule });
  } catch (error) {
    console.error("Error fetching initial schedule:", error);
    sendEvent({ type: "error", message: "Failed to fetch initial data" });
  }

  // Setup Change Stream with error handling
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
          // Filter schedule to only include driving test slots
          const fullSchedule = instructor.get('schedule', { lean: true }) || [];
          const drivingTestSchedule = fullSchedule.filter((slot: any) => slot.classType === "driving test");
          
          console.log(`🔄 Updated schedule for ${instructorId}: ${fullSchedule.length} total, ${drivingTestSchedule.length} driving test slots`);
          sendEvent({ type: "update", schedule: drivingTestSchedule });
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