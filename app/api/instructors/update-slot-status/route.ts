import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId, status, paid, paymentId, classType } = await req.json();

    console.log('🔄 [SAFE UPDATE] Updating slot status:', {
      slotId,
      instructorId,
      status,
      paid,
      paymentId,
      classType
    });

    if (!slotId || !instructorId) {
      return NextResponse.json(
        { error: "Missing slotId or instructorId" },
        { status: 400 }
      );
    }

    // Determine which schedule field to use based on classType
    const isDrivingTest = classType === 'driving_test' || classType === 'driving test';
    const scheduleField = isDrivingTest ? 'schedule_driving_test' : 'schedule_driving_lesson';
    
    console.log(`🔍 [SAFE UPDATE] Looking for ${isDrivingTest ? 'driving test' : 'driving lesson'} slot in ${scheduleField}`);
    
    // Find the instructor - try Instructor model first
    let instructor = await Instructor.findById(instructorId);
    let updateResult;
    
    if (instructor) {
      console.log('✅ [SAFE UPDATE] Found instructor in Instructor collection');
      
      // Use arrayFilters for precise, safe updates that don't affect other fields
        updateResult = await Instructor.updateOne(
        { _id: instructorId },
          {
            $set: {
            [`${scheduleField}.$[slot].status`]: status,
            [`${scheduleField}.$[slot].paid`]: paid,
            [`${scheduleField}.$[slot].paymentId`]: paymentId
          }
        },
        {
          arrayFilters: [{ "slot._id": slotId }]
        }
      );
      
      console.log(`🎯 [SAFE UPDATE] Instructor update result: ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
      
    } else {
      // Try User model
      instructor = await User.findById(instructorId);
      if (instructor) {
        console.log('✅ [SAFE UPDATE] Found instructor in User collection');
        
          updateResult = await User.updateOne(
          { _id: instructorId },
            {
              $set: {
              [`${scheduleField}.$[slot].status`]: status,
              [`${scheduleField}.$[slot].paid`]: paid,
              [`${scheduleField}.$[slot].paymentId`]: paymentId
            }
          },
          {
            arrayFilters: [{ "slot._id": slotId }]
          }
        );
        
        console.log(`🎯 [SAFE UPDATE] User update result: ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
      } else {
        console.error('❌ [SAFE UPDATE] Instructor not found in either User or Instructor collection:', instructorId);
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404 }
        );
      }
    }

    if (updateResult.modifiedCount > 0) {
      console.log('✅ [SAFE UPDATE] Slot updated successfully');
      return NextResponse.json({
        success: true,
        message: "Slot status updated successfully",
        modifiedCount: updateResult.modifiedCount
      });
    } else {
      console.log('❌ [SAFE UPDATE] No slot was updated - slot not found');
      return NextResponse.json(
        { error: "Slot not found or already updated" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ [SAFE UPDATE] Error updating slot status:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}