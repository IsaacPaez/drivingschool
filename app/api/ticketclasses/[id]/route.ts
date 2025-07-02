import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket class ID" },
        { status: 400 }
      );
    }

    const ticketClass = await TicketClass.findById(id).lean();
    
    if (!ticketClass) {
      return NextResponse.json(
        { error: "Ticket class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticketClass);
  } catch (error) {
    console.error("Error fetching ticket class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
