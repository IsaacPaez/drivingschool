import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor.tsx";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!date || !start || !end) {
      return NextResponse.json(
        { error: "Missing date, start, or end parameters" },
        { status: 400 }
      );
    }

    console.log("🔍 Debugging slots status for:", { date, start, end });

    // Find all instructors with slots matching the criteria
    const instructors = await Instructor.find({
      'schedule_driving_lesson.date': date,
      'schedule_driving_lesson.start': start,
      'schedule_driving_lesson.end': end
    });

    console.log("📊 Found instructors with matching slots:", instructors.length);

    const slotDetails = instructors.map(instructor => {
      const matchingSlots = instructor.schedule_driving_lesson?.filter(slot => 
        slot.date === date && slot.start === start && slot.end === end
      ) || [];

      return {
        instructorId: instructor._id,
        instructorName: instructor.name,
        slots: matchingSlots.map(slot => ({
          date: slot.date,
          start: slot.start,
          end: slot.end,
          status: slot.status,
          studentId: slot.studentId,
          studentName: slot.studentName,
          pickupLocation: slot.pickupLocation,
          dropoffLocation: slot.dropoffLocation
        }))
      };
    });

    return NextResponse.json({
      success: true,
      date,
      start,
      end,
      slotDetails
    });

  } catch (error) {
    console.error("❌ Error debugging slots status:", error);
    return NextResponse.json(
      { error: "Failed to debug slots status", details: error.message },
      { status: 500 }
    );
  }
}
