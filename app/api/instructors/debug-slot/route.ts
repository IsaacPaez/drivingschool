import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId } = await req.json();

    console.log('🔍 [DEBUG SLOT] Debugging slot:', { slotId, instructorId });

    if (!slotId || !instructorId) {
      return NextResponse.json(
        { error: "Missing slotId or instructorId" },
        { status: 400 }
      );
    }

    // Find the instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    console.log('✅ [DEBUG SLOT] Found instructor:', instructor.name);

    // Look for the slot in driving_test schedule
    const drivingTestSlot = instructor.schedule_driving_test?.find(
      (slot: any) => slot._id === slotId
    );

    // Look for the slot in driving_lesson schedule
    const drivingLessonSlot = instructor.schedule_driving_lesson?.find(
      (slot: any) => slot._id === slotId
    );

    const result = {
      slotId,
      instructorId,
      instructorName: instructor.name,
      foundInDrivingTest: !!drivingTestSlot,
      foundInDrivingLesson: !!drivingLessonSlot,
      drivingTestSlot: drivingTestSlot || null,
      drivingLessonSlot: drivingLessonSlot || null,
      allDrivingTestSlots: instructor.schedule_driving_test?.map((slot: any) => ({
        _id: slot._id,
        date: slot.date,
        start: slot.start,
        end: slot.end,
        status: slot.status,
        paid: slot.paid
      })) || [],
      allDrivingLessonSlots: instructor.schedule_driving_lesson?.map((slot: any) => ({
        _id: slot._id,
        date: slot.date,
        start: slot.start,
        end: slot.end,
        status: slot.status,
        paid: slot.paid
      })) || []
    };

    console.log('🔍 [DEBUG SLOT] Result:', result);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ [DEBUG SLOT] Error debugging slot:', (error as any)?.message || error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
