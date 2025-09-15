solcuion sseimport { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId, status } = await req.json();

    console.log('🔄 [CLEAN UPDATE] Updating driving test status:', {
      slotId,
      instructorId,
      status
    });

    if (!slotId || !instructorId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: slotId, instructorId, status" },
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

    console.log('✅ [CLEAN UPDATE] Found instructor:', instructor.name);

    // Strategy 1: Update by _id directly
    let updateResult = await Instructor.updateOne(
      {
        _id: instructorId,
        'schedule_driving_test._id': slotId
      },
      {
        $set: {
          'schedule_driving_test.$.status': status
        }
      }
    );

    console.log(`🎯 [CLEAN UPDATE] Strategy 1 (by _id): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);

    // Strategy 2: If not found and slotId looks like a date-time format, try parsing it
    if (updateResult.modifiedCount === 0 && slotId.includes('-')) {
      const parts = slotId.split('-');
      if (parts.length >= 5) {
        const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const start = parts[3];
        const end = parts[4];
        
        console.log(`🎯 [CLEAN UPDATE] Strategy 2 (by date-time): date=${date}, start=${start}, end=${end}`);
        
        updateResult = await Instructor.updateOne(
          {
            _id: instructorId,
            'schedule_driving_test.date': date,
            'schedule_driving_test.start': start,
            'schedule_driving_test.end': end
          },
          {
            $set: {
              'schedule_driving_test.$.status': status
            }
          }
        );
        
        console.log(`🎯 [CLEAN UPDATE] Strategy 2 result: ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
      }
    }

    // Strategy 3: If still not found, try to find by status=pending and studentId
    if (updateResult.modifiedCount === 0) {
      console.log(`🎯 [CLEAN UPDATE] Strategy 3: Finding by status=pending`);
      
      updateResult = await Instructor.updateOne(
        {
          _id: instructorId,
          'schedule_driving_test.status': 'pending',
          'schedule_driving_test.studentId': { $exists: true }
        },
        {
          $set: {
            'schedule_driving_test.$.status': status
          }
        }
      );
      
      console.log(`🎯 [CLEAN UPDATE] Strategy 3 result: ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
    }

    if (updateResult.modifiedCount === 0) {
      console.error(`❌ [CLEAN UPDATE] No slot found with any strategy for slotId: ${slotId}`);
      return NextResponse.json(
        { error: "Slot not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Driving test slot status updated to ${status}`,
      slotId: slotId,
      instructorId: instructorId,
      newStatus: status
    });

  } catch (error) {
    console.error('❌ [CLEAN UPDATE] Error updating driving test status:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
