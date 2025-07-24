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
      (student: { studentId: mongoose.Types.ObjectId } | string) => {
        if (typeof student === 'string') {
          return student === userId;
        } else if (typeof student === 'object' && student !== null && 'studentId' in student) {
          return student.studentId.toString() === userId;
        }
        return false;
      }
    );

    if (isAlreadyEnrolled) {
      return NextResponse.json(
        { error: "You are already enrolled in this class" },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = ticketClass.studentRequests?.find(
      (request: { studentId: mongoose.Types.ObjectId; status: string }) => {
        return request.studentId.toString() === userId && request.status === 'pending';
      }
    );

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this class" },
        { status: 400 }
      );
    }

    // Add the request using updateOne to avoid validation issues with the full document
    const updateResult = await TicketClass.updateOne(
      { _id: ticketClassId },
      {
        $push: {
          studentRequests: {
            studentId: new mongoose.Types.ObjectId(userId),
            requestDate: new Date(),
            status: 'pending'
          }
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to add request" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Your class request has been submitted successfully! To complete the enrollment process, please contact us at (561) 330-7007.", 
        success: true
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
