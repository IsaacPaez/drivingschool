import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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
    await connectDB();
    const { studentId, instructorId, date, start, end, classType } = await request.json();
    
    // console.log('📅 Booking request:', { studentId, instructorId, date, start, end, classType });
    
    if (!studentId || !instructorId || !date || !start || !end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Buscar al instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      // console.log('❌ Instructor not found:', instructorId);
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }
    
    // console.log(`📊 Instructor ${instructorId} has ${instructor.schedule?.length || 0} schedule slots`);
    
    // Buscar el slot específico que coincida con fecha, hora y tipo de clase
    const slot = instructor.schedule.find((slot: any) => 
      slot.date === date && 
      slot.start === start && 
      slot.end === end &&
      (classType ? slot.classType === classType : true)
    );
    
    if (!slot) {
      // console.log('❌ Slot not found:', { date, start, end, classType });
      // console.log('Available slots:', instructor.schedule?.filter((s: any) => s.date === date).map((s: any) => ({ start: s.start, end: s.end, classType: s.classType })));
      return NextResponse.json({ error: 'Slot not found or not available for this service type' }, { status: 404 });
    }
    
    // Verificar que el slot esté disponible
    if (slot.status !== 'free' && slot.status !== 'available') {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 409 });
    }
    
    if (slot.booked) {
      return NextResponse.json({ error: 'Slot is already booked' }, { status: 409 });
    }
    
    // Marcar como reservado
    slot.status = 'scheduled';
    slot.booked = true;
    slot.studentId = new mongoose.Types.ObjectId(studentId);
    
    // Marcar el documento como modificado y guardar
    instructor.markModified('schedule');
    await instructor.save();

    // Emit socket event for real-time updates (if socket.io is available)
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).io) {
        (globalThis as any).io.emit('scheduleUpdate', {
          instructorId,
          date,
          start,
          end,
          status: 'scheduled',
          studentId
        });
      }
    } catch (socketError) {
      // console.log('Socket emission failed:', socketError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Slot booked successfully',
      booking: {
        instructorId,
        date,
        start,
        end,
        classType: slot.classType || classType,
        studentId
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ 
      error: 'Failed to book slot', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 