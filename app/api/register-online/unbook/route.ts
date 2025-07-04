import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TicketClass from '@/models/TicketClass';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { ticketClassId, userId } = await request.json();

    if (!ticketClassId || !userId) {
      return NextResponse.json(
        { error: 'Missing ticketClassId or userId' },
        { status: 400 }
      );
    }

    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      return NextResponse.json(
        { error: 'Ticket class not found' },
        { status: 404 }
      );
    }

    // Check if the user is enrolled (soporta ambos formatos)
    const isEnrolled = ticketClass.students.some(
      (student: any) =>
        (typeof student === 'string' || typeof student === 'object' && student.toString && !student.studentId)
          ? student.toString() === userId
          : student.studentId === userId || student.studentId?.toString() === userId
    );

    if (!isEnrolled) {
      return NextResponse.json({ error: 'User is not enrolled in this class' }, { status: 400 });
    }

    // Elimina el usuario del array students, soportando ambos formatos
    ticketClass.students = ticketClass.students.filter(
      (student: any) =>
        (typeof student === 'string' || typeof student === 'object' && student.toString && !student.studentId)
          ? student.toString() !== userId
          : student.studentId !== userId && student.studentId?.toString() !== userId
    );

    await ticketClass.save();

    return NextResponse.json({
      message: 'Successfully unenrolled from class',
      ticketClass: {
        _id: ticketClass._id,
        enrolledStudents: ticketClass.students.length,
        totalSpots: ticketClass.cupos,
        availableSpots: ticketClass.cupos - ticketClass.students.length
      }
    });

  } catch (error) {
    console.error('Error unenrolling from class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
