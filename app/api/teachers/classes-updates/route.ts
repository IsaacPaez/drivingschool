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
    sendEvent({ type: "error", message: "Database connection failed" });
    writer.close();
    return new Response(stream.readable, { status: 500 });
  }

  // Function to fetch and send data, replicating the logic from the original endpoint
  const sendClassesData = async () => {
    try {
      const instructorObjId = new mongoose.Types.ObjectId(instructorId);
      const ticketclasses = await TicketClass.find({ instructorId: instructorObjId }).lean();
      
      const studentIds = [...new Set(ticketclasses.flatMap(tc => (tc.students || []).map(s => s.studentId?.toString() || s.toString())))];
      const validStudentIds = studentIds.filter(id => id && mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
      const students = await User.find({ _id: { $in: validStudentIds } }).lean();
      
      const classIds = [...new Set(ticketclasses.map(tc => tc.classId.toString()))].filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
      const classes = await Classes.find({ _id: { $in: classIds } }).lean();

      // We need to embed the student data into the classes for the frontend
      const populatedClasses = classes.map(c => {
        const ticket = ticketclasses.find(tc => tc.classId.toString() === (c as any)._id.toString());
        const classStudents = ticket ? ticket.students.map(s => {
            const studentId = s.studentId?.toString() || s.toString();
            return students.find(dbStudent => (dbStudent as any)._id.toString() === studentId);
        }).filter(Boolean) : [];
        return { ...c, students: classStudents };
      });
      
      sendEvent({ type: "update", classes: populatedClasses });

    } catch(err) {
      console.error("Error fetching teacher classes data:", err);
      sendEvent({ type: "error", message: "Failed to fetch classes data" });
    }
  };

  // Send initial data
  sendClassesData();

  // Setup Change Stream on the 'ticketclasses' collection
  const changeStream = mongoose.connection.collection('ticketclasses').watch([
    { $match: { 'fullDocument.instructorId': new mongoose.Types.ObjectId(instructorId) } }
  ]);

  changeStream.on('change', sendClassesData);

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