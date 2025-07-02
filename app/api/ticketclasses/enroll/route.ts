import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { studentId, ticketClassId, reason, citation_number, citation_ticket, course_country } = await request.json();
    
    // console.log('📝 Enrollment request:', { studentId, ticketClassId });
    
    if (!studentId || !ticketClassId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      // console.log('❌ Ticket class not found:', ticketClassId);
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    
    // Check if student is already enrolled
    const isAlreadyEnrolled = ticketClass.students.some(
      (student: any) => student.studentId.toString() === studentId
    );
    
    if (isAlreadyEnrolled) {
      return NextResponse.json({ error: 'Student is already enrolled in this class' }, { status: 409 });
    }
    
    // Check if class is full
    if (ticketClass.students.length >= ticketClass.cupos) {
      return NextResponse.json({ error: 'Class is full' }, { status: 409 });
    }
    
    // Add student to the class
    ticketClass.students.push({
      studentId: new mongoose.Types.ObjectId(studentId),
      reason: reason || '',
      citation_number: citation_number || '',
      citation_ticket: citation_ticket || '',
      course_country: course_country || ''
    });
    
    // Mark the document as modified and save
    ticketClass.markModified('students');
    await ticketClass.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in class',
      enrollment: {
        ticketClassId,
        studentId,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ 
      error: 'Failed to enroll in class', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
