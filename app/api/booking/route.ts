import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Instructor from '@/models/Instructor';
import mongoose from 'mongoose';

// Define proper types for socket.io
declare global {
  const io: {
    emit: (event: string, data: unknown) => void;
  };
}

interface Slot {
  start: string;
  end: string;
  status: 'free' | 'scheduled';
  booked: boolean;
  studentId?: mongoose.Types.ObjectId;
}

interface ScheduleDay {
  date: string;
  slots: Slot[];
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { studentId, instructorId, date, start, end } = await request.json();
    if (!studentId || !instructorId || !date || !start || !end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Buscar al instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }
    // Buscar el día
    const scheduleDay = instructor.schedule.find((s: ScheduleDay) => s.date === date);
    if (!scheduleDay) {
      return NextResponse.json({ error: 'No schedule for this date' }, { status: 404 });
    }
    // Buscar el slot
    const slot = scheduleDay.slots.find((slot: Slot) => slot.start === start && slot.end === end);
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    if (slot.status !== 'free') {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 409 });
    }
    // Marcar como reservado
    slot.status = 'scheduled';
    slot.booked = true;
    slot.studentId = new mongoose.Types.ObjectId(studentId);
    instructor.markModified('schedule');
    await instructor.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to book slot', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 