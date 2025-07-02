import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TicketClass from '@/models/TicketClass';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { ticketClassId } = await request.json();

    if (!ticketClassId) {
      return NextResponse.json({ error: 'Ticket class ID is required' }, { status: 400 });
    }

    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if user is enrolled in this class
    const userIndex = ticketClass.students.findIndex(
      (student: any) => student.studentId.toString() === session.user.id
    );

    if (userIndex === -1) {
      return NextResponse.json({ error: 'You are not enrolled in this class' }, { status: 400 });
    }

    // Remove the user from the students array
    ticketClass.students.splice(userIndex, 1);
    
    // Save the updated class
    await ticketClass.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully unenrolled from class',
      enrolledStudents: ticketClass.students.length,
      totalSpots: ticketClass.cupos,
      availableSpots: ticketClass.cupos - ticketClass.students.length
    });

  } catch (error) {
    console.error('Error unenrolling from class:', error);
    return NextResponse.json({ error: 'Failed to unenroll from class' }, { status: 500 });
  }
}
