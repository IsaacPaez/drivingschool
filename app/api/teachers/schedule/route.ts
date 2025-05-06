import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Instructor from '@/models/Instructor';

export async function POST(request: Request) {
  console.log('POST /api/teachers/schedule recibido');
  try {
    await connectToDatabase();
    const { instructorId, date, start, end } = await request.json();
    console.log('Datos recibidos:', { instructorId, date, start, end });

    // Buscar al instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      console.log('Instructor not found');
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Buscar si ya existe un schedule para esa fecha
    let scheduleDay = instructor.schedule.find((s: any) => s.date === date);
    if (scheduleDay) {
      // Agregar slot al día existente
      scheduleDay.slots.push({ start, end, booked: false });
    } else {
      // Crear nuevo día con el slot
      instructor.schedule.push({ date, slots: [{ start, end, booked: false }] });
    }

    console.log('Antes de guardar:', JSON.stringify(instructor.schedule, null, 2));
    await instructor.save();
    console.log('Después de guardar:', JSON.stringify(instructor.schedule, null, 2));
    return NextResponse.json({ success: true, data: instructor.schedule });
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ error: 'Failed to save schedule', details: error?.message }, { status: 500 });
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
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
} 