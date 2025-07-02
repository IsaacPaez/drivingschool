import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { studentId, instructorId, date, start, end } = await request.json();

    if (!studentId || !instructorId || !date || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar que el instructor existe
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    // Buscar el slot específico
    const schedule = instructor.get('schedule', { lean: false }) || [];
    const slotIndex = schedule.findIndex((slot: any) => 
      slot.start === start && 
      slot.end === end && 
      slot.date === date &&
      slot.studentId && 
      slot.studentId.toString() === studentId
    );

    if (slotIndex === -1) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const slot = schedule[slotIndex];

    // Liberar el slot
    slot.status = 'available';
    slot.studentId = null;
    slot.booked = false;

    await instructor.save();

    // Eliminar el registro de TicketClass
    await TicketClass.deleteOne({
      instructorId: new mongoose.Types.ObjectId(instructorId),
      date: new Date(date),
      hour: start,
      "students.studentId": new mongoose.Types.ObjectId(studentId)
    });

    console.log(`✅ Registration cancelled for student ${studentId} with instructor ${instructorId}`);

    return NextResponse.json({ 
      message: "Registration cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
