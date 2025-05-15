import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Instructor from '@/models/Instructor';

interface ScheduleSlot {
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled';
}

interface ScheduleDay {
  date: string;
  slots: ScheduleSlot[];
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { instructorId, date, start, end, status } = await request.json();

    // Buscar al instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Buscar si ya existe un schedule para esa fecha
    const scheduleDay = instructor.schedule.find((s: ScheduleDay) => s.date === date);
    if (scheduleDay) {
      // Agregar slot al día existente
      scheduleDay.slots.push({ start, end, status: status || 'free' });
    } else {
      // Crear nuevo día con el slot
      instructor.schedule.push({ date, slots: [{ start, end, status: status || 'free' }] });
    }

    await instructor.save();
    return NextResponse.json({ success: true, data: instructor.schedule });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to save schedule', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: instructor.schedule });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch schedules', details: errorMessage }, { status: 500 });
  }
} 