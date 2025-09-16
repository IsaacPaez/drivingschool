import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

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
    // Normalize to valid ObjectIds and remove falsy values
    const rawSlots: (string | null | undefined)[] = (slotIds && Array.isArray(slotIds)) ? slotIds : [slotId];
    const slotsToUpdate = rawSlots.filter(Boolean) as string[];
    
    if (!slotsToUpdate.length || !instructorId) {
      return NextResponse.json(
        { error: "Missing slotId(s) or instructorId" },
        { status: 400 }
      );
    }

    // Determine which schedule field(s) to use
    const isDrivingTest = classType === 'driving_test' || classType === 'driving test';
    const prefersLesson = !classType || classType === 'driving_lesson';
    const targetFields = classType ? [isDrivingTest ? 'schedule_driving_test' : 'schedule_driving_lesson'] : ['schedule_driving_lesson', 'schedule_driving_test'];
    
    console.log(`🔍 [SAFE UPDATE] Looking for slots in: ${targetFields.join(', ')}`);
    
    // Find the instructor - try Instructor model first
    let instructor = await Instructor.findById(instructorId);
    let totalModified = 0;
    let updateResults: { slotId: string; modified: boolean }[] = [];
    const objectIdList = slotsToUpdate.map(id => new mongoose.Types.ObjectId(id));
    const setFields: Record<string, any> = {
      status,
      paid,
      paymentId,
    };
    if (status === 'booked') {
      setFields.confirmedAt = new Date();
    }
    
    if (instructor) {
      console.log('✅ [SAFE UPDATE] Found instructor in Instructor collection');
      
      // Bulk update in a single operation per target field using $in
      for (const scheduleField of targetFields) {
        const updateResult = await Instructor.updateOne(
          { _id: instructorId },
          {
            $set: {
              [`${scheduleField}.$[slot].status`]: setFields.status,
              [`${scheduleField}.$[slot].paid`]: setFields.paid,
              [`${scheduleField}.$[slot].paymentId`]: setFields.paymentId,
              ...(setFields.confirmedAt ? { [`${scheduleField}.$[slot].confirmedAt`]: setFields.confirmedAt } : {})
            }
          },
          {
            arrayFilters: [{ "slot._id": { $in: objectIdList } }]
          }
        );
        totalModified += updateResult.modifiedCount;
      }

      // Populate updateResults for transparency
      for (const id of slotsToUpdate) {
        updateResults.push({ slotId: id, modified: true });
      }
      
    } else {
      // Try User model
      instructor = await User.findById(instructorId);
      if (instructor) {
        console.log('✅ [SAFE UPDATE] Found instructor in User collection');
        
        // Bulk update in a single operation per target field using $in
        for (const scheduleField of targetFields) {
          const updateResult = await User.updateOne(
            { _id: instructorId },
            {
              $set: {
                [`${scheduleField}.$[slot].status`]: setFields.status,
                [`${scheduleField}.$[slot].paid`]: setFields.paid,
                [`${scheduleField}.$[slot].paymentId`]: setFields.paymentId,
                ...(setFields.confirmedAt ? { [`${scheduleField}.$[slot].confirmedAt`]: setFields.confirmedAt } : {})
              }
            },
            {
              arrayFilters: [{ "slot._id": { $in: objectIdList } }]
            }
          );
          totalModified += updateResult.modifiedCount;
        }

        // Populate updateResults for transparency
        for (const id of slotsToUpdate) {
          updateResults.push({ slotId: id, modified: true });
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