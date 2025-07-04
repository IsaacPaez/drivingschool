import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { ticketClassId, userId } = body;
    
    if (!ticketClassId || !userId) {
      return NextResponse.json({ error: 'TicketClass ID and User ID are required' }, { status: 400 });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(ticketClassId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    
    if (!ticketClass) {
      return NextResponse.json({ error: 'Ticket class not found' }, { status: 404 });
    }

    // Check if user is already enrolled (soporta ambos formatos)
    const isAlreadyEnrolled = ticketClass.students.some(
      (student: any) => {
        if (!student) return false;
        // Si es formato antiguo (ObjectId directo)
        if (typeof student === 'string' || student instanceof mongoose.Types.ObjectId) {
          return student.toString() === userId;
        }
        // Formato nuevo
        return student.studentId === userId || student.studentId?.toString() === userId;
      }
    );

    if (isAlreadyEnrolled) {
      return NextResponse.json({ error: 'User is already enrolled in this class' }, { status: 400 });
    }

    // Check if there's space available
    const enrolledCount = ticketClass.students.length;
    const availableSpots = (ticketClass.cupos || 0) - enrolledCount;

    if (availableSpots <= 0) {
      return NextResponse.json({ error: 'No available spots in this class' }, { status: 400 });
    }

    // Agrega solo el ObjectId del usuario al array students
    ticketClass.students.push(new mongoose.Types.ObjectId(userId));

    await ticketClass.save();

    //console.log(`✅ User ${userId} successfully enrolled in ticket class ${ticketClassId}`);

    return NextResponse.json({ 
      message: 'Successfully enrolled in class',
      enrolledStudents: ticketClass.students.length,
      availableSpots: (ticketClass.cupos || 0) - ticketClass.students.length
    });

  } catch (error) {
    console.error('❌ Error enrolling in class:', error);
    return NextResponse.json({ error: 'Failed to enroll in class' }, { status: 500 });
  }
}
