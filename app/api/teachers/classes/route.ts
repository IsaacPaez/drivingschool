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

  // Buscar todas las ticketclasses de ese instructor y popular los estudiantes
  const ticketclasses = await TicketClass.find({ instructorId }).lean();

  // Obtener los studentIds únicos
  const studentIds = [
    ...new Set(
      ticketclasses
        .flatMap(tc => (tc.students || []))
        .map(s => typeof s === 'object' && s.studentId ? s.studentId.toString() : s.toString())
    )
  ];

  // Filtra solo los que son ObjectId válidos
  const validStudentIds = studentIds.filter(id => mongoose.Types.ObjectId.isValid(id));

  // Convertir los IDs a ObjectId
  const objectIds = validStudentIds
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));

  // Buscar los estudiantes por ObjectId
  const students = await User.find({
    $or: [
      { _id: { $in: objectIds } },
      { _id: { $in: validStudentIds.map(id => id.toString()) } }
    ]
  }).lean();
  //console.log('students found:', students);

  // Obtener los classId únicos
  const classIds = [
    ...new Set(ticketclasses.map(tc => tc.classId.toString()))
  ];

  // Buscar los cursos en el modelo Classes
  const classes = await Classes.find({ _id: { $in: classIds } }).lean();

  return NextResponse.json({ classes, students, ticketclasses });
} 