import { NextRequest, NextResponse } from "next/server";
import TicketClass from "@/models/TicketClass";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId");
  try {
    const filter = instructorId ? { instructorId } : {};
    const ticketClasses = await TicketClass.find(filter).populate("locationId classId students");
    return NextResponse.json(ticketClasses);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching ticket classes" }, { status: 500 });
  }
} 