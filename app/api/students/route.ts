import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import Classes from "@/models/Classes";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  // Buscar ticketclasses donde el arreglo students contiene el ID del estudiante (como string)
  const ticketclasses = await TicketClass.find({
    students: studentId
  }).lean();

  // Obtener los classIds únicos
  const classIds = [...new Set(ticketclasses.map(tc => tc.classId.toString()))];

  // Buscar los cursos correspondientes
  const courses = await Classes.find({ _id: { $in: classIds } }).lean();

  return NextResponse.json({ ticketclasses, courses });
}
