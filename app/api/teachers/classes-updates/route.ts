import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import Classes from "@/models/Classes";
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
      // Stream closed
    }
  };

  try {
    await connectDB();
  } catch (error) {
    sendEvent({ type: "error", message: "Database connection failed" });
    writer.close();
    return new Response(stream.readable, { status: 500 });
  }

  // Helper to fetch and send all ticketclasses for this instructor
  const sendAllTicketClasses = async () => {
    const ticketClasses = await TicketClass.find({ instructorId }).lean();
    const ticketClassesWithInfo = await Promise.all(
      ticketClasses.map(async (tc: any) => {
        const classInfo = await Classes.findById(tc.classId).lean();
        return {
          ...tc,
          classInfo: classInfo ? {
            _id: classInfo._id,
            title: classInfo.title,
            overview: classInfo.overview,
            length: classInfo.length,
            price: classInfo.price
          } : null
        };
      })
    );
    sendEvent({ type: "update", classes: ticketClassesWithInfo });
  };

  // Send initial data
  await sendAllTicketClasses();

  // Setup Change Stream for real-time updates
  let changeStream: any = null;
  try {
    changeStream = mongoose.connection.collection('ticketclasses').watch([
      { $match: { 'fullDocument.instructorId': new mongoose.Types.ObjectId(instructorId) } }
    ]);

    changeStream.on('change', async () => {
      await sendAllTicketClasses();
    });

    changeStream.on('error', (error: any) => {
      sendEvent({ type: "error", message: "Database change stream error" });
    });
  } catch (error) {
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