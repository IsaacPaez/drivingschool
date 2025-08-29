import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    console.log("📝 Creating ticket class request:", body);

    const { 
      studentId, 
      ticketClassId, 
      classId, 
      date, 
      start, 
      end, 
      paymentMethod 
    } = body;

    // Validation
    if (!studentId || !ticketClassId) {
      return NextResponse.json(
        { error: "Missing required fields: studentId or ticketClassId" },
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
    const isAlreadyEnrolled = ticketClass.students.some(
      (student: any) => 
        (typeof student === 'string' && student === studentId) ||
        (typeof student === 'object' && student.studentId === studentId)
    );

    if (isAlreadyEnrolled) {
      return NextResponse.json(
        { error: "Student is already enrolled in this class" },
        { status: 400 }
      );
    }

    // Check if student already has a pending request
    const hasPendingRequest = ticketClass.studentRequests?.some(
      (request: any) => request.studentId === studentId && request.status === 'pending'
    );

    if (hasPendingRequest) {
      return NextResponse.json(
        { error: "Student already has a pending request for this class" },
        { status: 400 }
      );
    }

    // Check if there are available spots
    if (ticketClass.availableSpots <= 0) {
      return NextResponse.json(
        { error: "No available spots in this class" },
        { status: 400 }
      );
    }

    // Create student request
    const studentRequest = {
      studentId: studentId,
      requestDate: new Date(),
      status: 'pending',
      paymentMethod: paymentMethod || 'instructor',
      classDetails: {
        classId: classId,
        date: date,
        start: start,
        end: end
      }
    };

    // Update the ticket class with the request
    const updateResult = await TicketClass.updateOne(
      { _id: ticketClassId },
      {
        $push: { studentRequests: studentRequest },
        $set: { updatedAt: new Date() }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }

    console.log("✅ Ticket class request created successfully:", ticketClassId);
    console.log("📊 Student request added:", studentRequest);

    return NextResponse.json({
      success: true,
      message: "Request created successfully",
      ticketClassId: ticketClassId,
      studentId: studentId,
      requestId: studentRequest.requestDate.getTime().toString(),
      status: 'pending'
    });

  } catch (error) {
    console.error("❌ Error creating ticket class request:", error);
    return NextResponse.json(
      { error: "Failed to create request", details: error.message },
      { status: 500 }
    );
  }
}
