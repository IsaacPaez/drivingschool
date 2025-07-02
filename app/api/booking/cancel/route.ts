import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Instructor from '@/models/Instructor';
import mongoose from 'mongoose';

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

    // Buscar el slot
    const slot = instructor.schedule.find((slot: any) => 
      slot.date === date && slot.start === start && slot.end === end
    );
    
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    // Verificar que el slot pertenece al estudiante
    if (slot.studentId?.toString() !== studentId) {
      return NextResponse.json({ error: 'Unauthorized to cancel this booking' }, { status: 403 });
    }

    // Liberar el slot y volverlo disponible
    slot.status = 'available';
    slot.booked = false;
    slot.studentId = null;
    
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
          status: 'available',
          studentId: null
        });
      }
    } catch (socketError) {
      console.log('Socket emission failed:', socketError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking cancelled successfully. Slot is now available.',
      slot: {
        date,
        start,
        end,
        status: 'available'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to cancel booking', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 