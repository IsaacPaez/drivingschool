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
    if (instructor) {
      sendEvent({ type: "initial", schedule: instructor.get('schedule', { lean: true }) || [] });
    }
  } catch (error) {
    console.error("Error fetching initial schedule:", error);
    sendEvent({ type: "error", message: "Failed to fetch initial data" });
  }

  // Setup Change Stream
  const changeStream = mongoose.connection.collection('instructors').watch([
    { $match: { 'documentKey._id': new mongoose.Types.ObjectId(instructorId) } }
  ]);

  changeStream.on('change', async () => {
    try {
      const instructor = await Instructor.findById(instructorId);
      if (instructor) {
        sendEvent({ type: "update", schedule: instructor.get('schedule', { lean: true }) || [] });
      }
    } catch(err) {
      console.error("Error fetching updated schedule for broadcast:", err);
    }
  });

  // Handle client disconnect
  req.signal.addEventListener('abort', () => {
    changeStream.close();
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