import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId, status, paid, paymentId, confirmedAt } = await req.json();

    console.log('🔄 [FORCE UPDATE] Updating slot status:', {
      slotId,
      instructorId,
      status,
      paid,
      paymentId
    });

    if (!slotId || !instructorId) {
      return NextResponse.json(
        { error: "Missing slotId or instructorId" },
        { status: 400 }
      );
    }

    // Find the instructor - try both User and Instructor models
    let instructor = await User.findById(instructorId);
    let updateResult;
    
    if (instructor) {
      console.log('✅ [FORCE UPDATE] Found instructor in User collection');
      // Update the specific slot in schedule_driving_lesson array using slotId
      updateResult = await User.updateOne(
        {
          _id: instructorId,
          'schedule_driving_lesson._id': slotId
        },
        {
          $set: {
            'schedule_driving_lesson.$.status': status,
            'schedule_driving_lesson.$.paid': paid,
            'schedule_driving_lesson.$.paymentId': paymentId,
            'schedule_driving_lesson.$.confirmedAt': new Date(confirmedAt),
            'schedule_driving_lesson.$.studentName': 'Confirmed'
          }
        }
      );
    } else {
      // Try Instructor model
      instructor = await Instructor.findById(instructorId);
      if (instructor) {
        console.log('✅ [FORCE UPDATE] Found instructor in Instructor collection');
        // Update the specific slot in schedule_driving_lesson array using slotId
        updateResult = await Instructor.updateOne(
          {
            _id: instructorId,
            'schedule_driving_lesson._id': slotId
          },
          {
            $set: {
              'schedule_driving_lesson.$.status': status,
              'schedule_driving_lesson.$.paid': paid,
              'schedule_driving_lesson.$.paymentId': paymentId,
              'schedule_driving_lesson.$.confirmedAt': new Date(confirmedAt),
              'schedule_driving_lesson.$.studentName': 'Confirmed'
            }
          }
        );
      } else {
        console.error('❌ [FORCE UPDATE] Instructor not found in either User or Instructor collection:', instructorId);
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404 }
        );
      }
    }

    console.log('🔄 [FORCE UPDATE] Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      slotId,
      instructorId
    });

    if (updateResult.modifiedCount > 0) {
      console.log('✅ [FORCE UPDATE] Slot successfully updated to booked status');
      return NextResponse.json({
        success: true,
        message: "Slot status updated successfully",
        slotId,
        instructorId,
        status,
        paid
      });
    } else {
      console.error('❌ [FORCE UPDATE] No slot was updated - slot not found or already updated');
      return NextResponse.json(
        { error: "Slot not found or already updated" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ [FORCE UPDATE] Error updating slot status:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
