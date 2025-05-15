import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");

  const filter: any = {};
  if (instructorId) filter.instructorId = instructorId;
  if (classId) filter.classId = classId;
  if (studentId) filter.students = studentId;

  const ticketclasses = await TicketClass.find(filter).lean();
  return NextResponse.json(ticketclasses);
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  // Suponiendo que el body tiene los datos necesarios para crear o actualizar una clase
  let ticketClass;
  if (body._id) {
    // Actualizar clase existente
    ticketClass = await TicketClass.findByIdAndUpdate(body._id, body, { new: true });
  } else {
    // Crear nueva clase
    ticketClass = await TicketClass.create(body);
  }

  return NextResponse.json(ticketClass);
} 