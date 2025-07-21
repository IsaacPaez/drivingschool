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
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
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

    // Check if user has a pending request
    const hasRequest = ticketClass.studentRequests?.some(
      (request: any) => request.studentId.toString() === userId && request.status === 'pending'
    );

    if (!hasRequest) {
      return NextResponse.json(
        { error: "No pending request found for this class" },
        { status: 400 }
      );
    }

    // Remove the user's request from studentRequests array using updateOne
    const result = await TicketClass.updateOne(
      { _id: ticketClassId },
      { 
        $pull: { 
          studentRequests: { 
            studentId: new mongoose.Types.ObjectId(userId), 
            status: 'pending' 
          } 
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No pending request found or already cancelled" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Request cancelled successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error cancelling class request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
