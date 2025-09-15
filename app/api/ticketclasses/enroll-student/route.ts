import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

// Import models
const TicketClass = mongoose.models.TicketClass || mongoose.model('TicketClass', new mongoose.Schema({}, { strict: false }), 'ticketclasses');

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      ticketClassId,
      studentId,
      orderId,
      orderNumber
    } = await req.json();

    console.log('🎓 Enrolling student in ticket class:', {
      ticketClassId,
      studentId,
      orderId,
      orderNumber
    });

    // Validate required fields
    if (!ticketClassId || !studentId) {
      return NextResponse.json(
        { error: "Missing required fields: ticketClassId, studentId" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(ticketClassId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid ticketClassId or studentId" },
        { status: 400 }
      );
    }

    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      return NextResponse.json(
        { error: "Ticket class not found" },
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    const students = ticketClass.students || [];
    const isAlreadyEnrolled = students.some((student: any) => 
      student.studentId && student.studentId.toString() === studentId
    );

    if (isAlreadyEnrolled) {
      console.log('ℹ️ Student already enrolled in this ticket class');
      return NextResponse.json({
        success: true,
        message: "Student already enrolled",
        alreadyEnrolled: true
      });
    }

    // Remove from studentRequests
    if (ticketClass.studentRequests && Array.isArray(ticketClass.studentRequests)) {
      const initialRequestsLength = ticketClass.studentRequests.length;
      
      ticketClass.studentRequests = ticketClass.studentRequests.filter((request: any) => 
        request.studentId.toString() !== studentId
      );

      const finalRequestsLength = ticketClass.studentRequests.length;
      const removedRequestsCount = initialRequestsLength - finalRequestsLength;
      
      console.log(`🗑️ Removed ${removedRequestsCount} student request(s)`);
    }

    // Add to students array
    const newStudent = {
      studentId: new mongoose.Types.ObjectId(studentId),
      enrollmentDate: new Date(),
      status: 'enrolled',
      orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
      orderNumber: orderNumber || undefined
    };

    if (!ticketClass.students) {
      ticketClass.students = [];
    }
    
    ticketClass.students.push(newStudent);
    
    // Update timestamp
    ticketClass.updatedAt = new Date();

    // Save changes using updateOne to avoid validation issues
    await TicketClass.updateOne(
      { _id: ticketClassId },
      { 
        students: ticketClass.students,
        studentRequests: ticketClass.studentRequests,
        updatedAt: ticketClass.updatedAt
      }
    );

    console.log('✅ Student enrolled successfully in ticket class');

    return NextResponse.json({
      success: true,
      message: "Student enrolled successfully",
      enrolledStudent: newStudent,
      totalStudents: ticketClass.students.length
    });

  } catch (error) {
    console.error('❌ Error enrolling student in ticket class:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
