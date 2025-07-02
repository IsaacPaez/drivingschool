import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { studentId, instructorId, date, start, end, classType } = await request.json();

    if (!studentId || !instructorId || !date || !start || !end || !classType) {
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
      slot.classType === classType
    );

    if (slotIndex === -1) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    const slot = schedule[slotIndex];

    // Verificar que el slot está disponible
    if (slot.status !== 'free' && slot.status !== 'available') {
      return NextResponse.json(
        { error: "Slot is not available" },
        { status: 400 }
      );
    }

    if (slot.booked || slot.studentId) {
      return NextResponse.json(
        { error: "Slot is already booked" },
        { status: 400 }
      );
    }

    // Actualizar el slot en el instructor
    slot.status = 'scheduled';
    slot.studentId = new mongoose.Types.ObjectId(studentId);
    slot.booked = true;

    await instructor.save();

    // Crear registro en TicketClass
    const ticketClass = new TicketClass({
      studentId: new mongoose.Types.ObjectId(studentId),
      instructorId: new mongoose.Types.ObjectId(instructorId),
      locationId: instructor.location || null,
      date: new Date(date),
      hour: start,
      endHour: end,
      classId: slot._id, // Usar el ID del slot como referencia
      type: classType.toLowerCase(), // ADI, BDI, DATE en minúsculas
      duration: "1h", // Duración por defecto
      students: [{
        studentId: new mongoose.Types.ObjectId(studentId)
      }]
    });

    await ticketClass.save();

    console.log(`✅ Student ${studentId} registered for ${classType} class with instructor ${instructorId}`);
    console.log(`✅ TicketClass created with ID: ${ticketClass._id}`);

    return NextResponse.json({ 
      message: "Registration successful",
      ticketClassId: ticketClass._id
    });

  } catch (error) {
    console.error("Error registering for class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
