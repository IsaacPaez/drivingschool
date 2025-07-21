import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { ticketClassId, userId } = await req.json();

    if (!ticketClassId || !userId) {
      return NextResponse.json(
        { error: "TicketClass ID and User ID are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketClassId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = ticketClass.students.some(
      (student: any) => 
        (typeof student === 'string' ? student : student.studentId) === userId
    );

    if (isAlreadyEnrolled) {
      return NextResponse.json(
        { error: "You are already enrolled in this class" },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = ticketClass.studentRequests?.find(
      (request: any) => request.studentId === userId && request.status === 'pending'
    );

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this class" },
        { status: 400 }
      );
    }

    // Add the request to studentRequests array
    const newRequest = {
      studentId: new mongoose.Types.ObjectId(userId),
      requestDate: new Date(),
      status: 'pending' as const
    };

    if (!ticketClass.studentRequests) {
      ticketClass.studentRequests = [];
    }

    ticketClass.studentRequests.push(newRequest);
    
    await ticketClass.save();

    return NextResponse.json(
      { 
        message: "Your class request has been submitted successfully! To complete the enrollment process, please contact us at (561) 330-7007.", 
        request: newRequest 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error sending class request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
