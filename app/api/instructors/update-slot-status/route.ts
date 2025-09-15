import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId, status, paid, paymentId, classType, slotIds } = await req.json();

    console.log('🔄 [SAFE UPDATE] Updating slot status:', {
      slotId,
      instructorId,
      status,
      paid,
      paymentId,
      classType,
      slotIds
    });

    // Handle both single slot and multiple slots (package)
    const slotsToUpdate = slotIds && Array.isArray(slotIds) ? slotIds : [slotId];
    
    if (!slotsToUpdate.length || !instructorId) {
      return NextResponse.json(
        { error: "Missing slotId(s) or instructorId" },
        { status: 400 }
      );
    }

    // Determine which schedule field to use based on classType
    const isDrivingTest = classType === 'driving_test' || classType === 'driving test';
    const scheduleField = isDrivingTest ? 'schedule_driving_test' : 'schedule_driving_lesson';
    
    console.log(`🔍 [SAFE UPDATE] Looking for ${isDrivingTest ? 'driving test' : 'driving lesson'} slot in ${scheduleField}`);
    
    // Find the instructor - try Instructor model first
    let instructor = await Instructor.findById(instructorId);
    let totalModified = 0;
    let updateResults: { slotId: string; modified: boolean }[] = [];
    
    if (instructor) {
      console.log('✅ [SAFE UPDATE] Found instructor in Instructor collection');
      
      // Update each slot in the package
      for (const currentSlotId of slotsToUpdate) {
        console.log(`🔄 [SAFE UPDATE] Updating slot: ${currentSlotId}`);
        
        const updateResult = await Instructor.updateOne(
          { _id: instructorId },
          {
            $set: {
              [`${scheduleField}.$[slot].status`]: status,
              [`${scheduleField}.$[slot].paid`]: paid,
              [`${scheduleField}.$[slot].paymentId`]: paymentId
            }
          },
          {
            arrayFilters: [{ "slot._id": currentSlotId }]
          }
        );
        
        updateResults.push({
          slotId: currentSlotId as string,
          modified: updateResult.modifiedCount > 0
        });
        
        totalModified += updateResult.modifiedCount;
        console.log(`🎯 [SAFE UPDATE] Slot ${currentSlotId}: ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
      }
      
    } else {
      // Try User model
      instructor = await User.findById(instructorId);
      if (instructor) {
        console.log('✅ [SAFE UPDATE] Found instructor in User collection');
        
        // Update each slot in the package
        for (const currentSlotId of slotsToUpdate) {
          console.log(`🔄 [SAFE UPDATE] Updating slot: ${currentSlotId}`);
          
          const updateResult = await User.updateOne(
            { _id: instructorId },
            {
              $set: {
                [`${scheduleField}.$[slot].status`]: status,
                [`${scheduleField}.$[slot].paid`]: paid,
                [`${scheduleField}.$[slot].paymentId`]: paymentId
              }
            },
            {
              arrayFilters: [{ "slot._id": currentSlotId }]
            }
          );
          
          updateResults.push({
            slotId: currentSlotId as string,
            modified: updateResult.modifiedCount > 0
          });
          
          totalModified += updateResult.modifiedCount;
          console.log(`🎯 [SAFE UPDATE] Slot ${currentSlotId}: ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
        }
      } else {
        console.error('❌ [SAFE UPDATE] Instructor not found in either User or Instructor collection:', instructorId);
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404 }
        );
      }
    }

    if (totalModified > 0) {
      console.log(`✅ [SAFE UPDATE] Updated ${totalModified} slots successfully`);
      return NextResponse.json({
        success: true,
        message: `${totalModified} slot(s) updated successfully`,
        modifiedCount: totalModified,
        results: updateResults
      });
    } else {
      console.log('❌ [SAFE UPDATE] No slots were updated - slots not found');
      return NextResponse.json(
        { error: "Slots not found or already updated" },
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