import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { studentId, ticketClassId } = await request.json();
    
    // console.log('🗑️ Cancellation request:', { studentId, ticketClassId });
    
    if (!studentId || !ticketClassId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      // console.log('❌ Ticket class not found:', ticketClassId);
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    
    // Check if student is enrolled
    const studentIndex = ticketClass.students.findIndex(
      (student: any) => student.studentId.toString() === studentId
    );
    
    if (studentIndex === -1) {
      return NextResponse.json({ error: 'Student is not enrolled in this class' }, { status: 404 });
    }
    
    // Remove student from the class
    ticketClass.students.splice(studentIndex, 1);
    
    // Mark the document as modified and save
    ticketClass.markModified('students');
    await ticketClass.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully cancelled enrollment',
      cancellation: {
        ticketClassId,
        studentId,
        cancelledAt: new Date()
      }
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel enrollment', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
