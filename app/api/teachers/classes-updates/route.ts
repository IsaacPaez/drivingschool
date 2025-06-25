import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import Classes from "@/models/Classes";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId");

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
      console.warn("SSE stream for teacher classes closed prematurely.");
    }
  };
  
  try {
    await connectDB();
  } catch (error) {
    console.error("Database connection failed for teacher classes SSE:", error);
    sendEvent({ type: "error", message: "Database connection failed" });
    writer.close();
    return new Response(stream.readable, { status: 500 });
  }

  // Send initial data
  try {
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      sendEvent({ type: "error", message: "Instructor not found" });
      writer.close();
      return new Response(stream.readable, { status: 404 });
    }

    // Get instructor's classes
    const classes = await Classes.find({ instructorId });
    sendEvent({ type: "initial", classes });
  } catch (error) {
    console.error("Error fetching initial teacher classes:", error);
    sendEvent({ type: "error", message: "Failed to fetch initial data" });
  }

  // Setup Change Stream with error handling
  let changeStream: any = null;
  try {
    changeStream = mongoose.connection.collection('classes').watch([
      { $match: { 'instructorId': instructorId } }
    ]);

    changeStream.on('change', async () => {
      try {
        const classes = await Classes.find({ instructorId });
        sendEvent({ type: "update", classes });
      } catch(err) {
        console.error("Error fetching updated classes for broadcast:", err);
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