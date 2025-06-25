import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("id");

  if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
    return new Response(JSON.stringify({ error: "Invalid instructor ID" }), { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: object) => {
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
      sendEvent({ type: "error", message: "Instructor not found" });
      writer.close();
      return new Response(stream.readable, { status: 404 });
    }
    
    const schedule = instructor.get('schedule', { lean: true }) || [];
    sendEvent({ type: "initial", schedule });
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
        const instructor = await Instructor.findById(instructorId);
        if (instructor) {
          const schedule = instructor.get('schedule', { lean: true }) || [];
          sendEvent({ type: "update", schedule });
        }
      } catch(err) {
        console.error("Error fetching updated schedule for broadcast:", err);
        sendEvent({ type: "error", message: "Failed to fetch updated data" });
      }
    });

    changeStream.on('error', (error: any) => {
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
    writer.close().catch(() => {});
  });
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 