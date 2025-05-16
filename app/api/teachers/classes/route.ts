import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import Classes from "@/models/Classes";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");

  if (!instructorId) {
    return NextResponse.json({ error: "instructorId is required" }, { status: 400 });
  }

  // Buscar todas las ticketclasses de ese instructor
  const ticketclasses = await TicketClass.find({ instructorId }).lean();

  // Obtener los classId únicos
  const classIds = [
    ...new Set(ticketclasses.map(tc => tc.classId.toString()))
  ];

  // Buscar los cursos en el modelo Classes
  const classes = await Classes.find({ _id: { $in: classIds } }).lean();

  // Obtener los studentIds únicos
  const studentIds = [
    ...new Set(ticketclasses.flatMap(tc => (tc.students || []).map((s: mongoose.Types.ObjectId) => s.toString())))
  ];

  // Buscar los estudiantes
  const students = await User.find({ _id: { $in: studentIds } }).lean();

  return NextResponse.json({ classes, students });
} 