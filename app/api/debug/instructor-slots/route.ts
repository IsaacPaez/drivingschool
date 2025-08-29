import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("instructorId");

    if (!instructorId) {
      return NextResponse.json(
        { error: "Missing instructorId parameter" },
        { status: 400 }
      );
    }

    console.log("🔍 Debugging instructor slots for:", instructorId);

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    console.log("✅ Instructor found:", instructor.name);
    console.log("📊 Total slots:", instructor.schedule_driving_lesson?.length || 0);

    // Get a sample of slots to see their exact format
    const sampleSlots = instructor.schedule_driving_lesson?.slice(0, 10) || [];
    
    const slotDetails = sampleSlots.map(slot => ({
      date: slot.date,
      start: slot.start,
      end: slot.end,
      status: slot.status,
      studentId: slot.studentId,
      studentName: slot.studentName,
      pickupLocation: slot.pickupLocation,
      dropoffLocation: slot.dropoffLocation,
      // Create the key that we're trying to match
      generatedKey: `${slot.date}-${slot.start}-${slot.end}`,
      // Check if this matches any of our expected formats
      matchesExpected: {
        "2025-09-16-14:30-16:30": `${slot.date}-${slot.start}-${slot.end}` === "2025-09-16-14:30-16:30",
        "2025-09-17-14:30-16:30": `${slot.date}-${slot.start}-${slot.end}` === "2025-09-17-14:30-16:30",
        "2025-09-18-14:30-16:30": `${slot.date}-${slot.start}-${slot.end}` === "2025-09-18-14:30-16:30"
      }
    }));

    return NextResponse.json({
      success: true,
      instructorName: instructor.name,
      totalSlots: instructor.schedule_driving_lesson?.length || 0,
      sampleSlots: slotDetails
    });

  } catch (error) {
    console.error("❌ Error debugging instructor slots:", error);
    return NextResponse.json(
      { error: "Failed to debug instructor slots", details: error.message },
      { status: 500 }
    );
  }
}
