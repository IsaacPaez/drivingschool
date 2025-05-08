import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Instructor from '@/models/Instructor';

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
    const scheduleDay = instructor.schedule.find((s: any) => s.date === date);
    if (!scheduleDay) {
      return NextResponse.json({ error: 'No schedule for this date' }, { status: 404 });
    }
    // Buscar el slot
    const slot = scheduleDay.slots.find((slot: any) => slot.start === start && slot.end === end);
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    if (slot.status !== 'free') {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 409 });
    }
    // Marcar como reservado
    slot.status = 'scheduled';
    // Puedes guardar el studentId en el slot si tu modelo lo permite
    // slot.studentId = studentId;
    await instructor.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book slot', details: (error as any)?.message || String(error) }, { status: 500 });
  }
} 