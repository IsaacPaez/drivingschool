import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId, status, paid, paymentId, slotIds } = await req.json();

    console.log('🔄 [DRIVING LESSON UPDATE] Updating driving lesson status:', {
      slotId,
      instructorId,
      status,
      paid,
      paymentId,
      slotIds
    });

    // Handle both single slot and multiple slots (package)
    const rawSlots: (string | null | undefined)[] = (slotIds && Array.isArray(slotIds)) ? slotIds : [slotId];
    const slotsToUpdate = rawSlots.filter(Boolean) as string[];

    if (!slotsToUpdate.length || !instructorId) {
      return NextResponse.json(
        { error: "Missing slotId(s) or instructorId" },
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

    console.log('✅ [DRIVING LESSON UPDATE] Found instructor:', instructor.name);

    // Prepare update fields
    const setFields: Record<string, any> = {
      status,
    };
    
    if (paid !== undefined) setFields.paid = paid;
    if (paymentId) setFields.paymentId = paymentId;
    if (status === 'booked') {
      setFields.confirmedAt = new Date();
    }

    let totalModified = 0;
    const updateResults: { slotId: string; modified: boolean }[] = [];

    // Separate ObjectId and string IDs
    const objectIdList: mongoose.Types.ObjectId[] = [];
    const stringIdList: string[] = [];
    
    for (const id of slotsToUpdate) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        objectIdList.push(new mongoose.Types.ObjectId(id));
      } else {
        stringIdList.push(id);
      }
    }

    // Strategy 1: Update each slot individually using findOneAndUpdate to preserve all existing fields
    if (slotsToUpdate.length > 0) {
      console.log(`🔍 [DRIVING LESSON UPDATE] Updating ${slotsToUpdate.length} slots individually to preserve ALL existing fields`);
      
      for (const slotIdToUpdate of slotsToUpdate) {
        try {
          console.log(`🔍 [DRIVING LESSON UPDATE] Processing slot ${slotIdToUpdate}`);
          
          // Find the instructor and the specific slot to verify it exists
          const instructor = await Instructor.findById(instructorId);
          if (!instructor) {
            console.error(`❌ [DRIVING LESSON UPDATE] Instructor ${instructorId} not found`);
            continue;
          }
          
          // Find the specific slot index
          const slotIndex = instructor.schedule_driving_lesson.findIndex((slot: any) => 
            slot._id.toString() === slotIdToUpdate
          );
          
          if (slotIndex === -1) {
            console.error(`❌ [DRIVING LESSON UPDATE] Slot ${slotIdToUpdate} not found in instructor's schedule`);
            continue;
          }
          
          console.log(`🔍 [DRIVING LESSON UPDATE] Found slot at index ${slotIndex}, preserving existing fields:`, {
            pickupLocation: instructor.schedule_driving_lesson[slotIndex].pickupLocation,
            dropoffLocation: instructor.schedule_driving_lesson[slotIndex].dropoffLocation,
            studentId: instructor.schedule_driving_lesson[slotIndex].studentId,
            studentName: instructor.schedule_driving_lesson[slotIndex].studentName
          });
          
          // Build update object using dot notation with array index to preserve all other fields
          const updateFields: any = {};
          
          // Always update status
          updateFields[`schedule_driving_lesson.${slotIndex}.status`] = setFields.status;
          
          // Only update paid if provided
          if (setFields.paid !== undefined) {
            updateFields[`schedule_driving_lesson.${slotIndex}.paid`] = setFields.paid;
          }
          
          // Only update paymentId if provided
          if (setFields.paymentId) {
            updateFields[`schedule_driving_lesson.${slotIndex}.paymentId`] = setFields.paymentId;
          }
          
          // Only update confirmedAt if provided
          if (setFields.confirmedAt) {
            updateFields[`schedule_driving_lesson.${slotIndex}.confirmedAt`] = setFields.confirmedAt;
          }
          
          console.log(`🔍 [DRIVING LESSON UPDATE] Updating slot ${slotIdToUpdate} with specific fields:`, updateFields);
          
          const updateResult = await Instructor.updateOne(
            { _id: instructorId },
            { $set: updateFields }
          );
          
          if (updateResult.modifiedCount > 0) {
            totalModified++;
            console.log(`✅ [DRIVING LESSON UPDATE] Successfully updated slot ${slotIdToUpdate} while preserving all existing fields`);
          } else {
            console.error(`❌ [DRIVING LESSON UPDATE] Failed to update slot ${slotIdToUpdate} - no modifications made`);
          }
        } catch (error) {
          console.error(`❌ [DRIVING LESSON UPDATE] Error updating slot ${slotIdToUpdate}:`, error);
        }
      }
      
      console.log(`🎯 [DRIVING LESSON UPDATE] Individual slot processing complete: ${totalModified}/${slotsToUpdate.length} slots updated`);
    }

    // Strategy 3: If still no updates and slotId looks like date-time format, try parsing
    if (totalModified === 0 && slotId && slotId.includes('-')) {
      const parts = slotId.split('-');
      if (parts.length >= 5) {
        const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const start = parts[3];
        const end = parts[4];
        
        console.log(`🎯 [DRIVING LESSON UPDATE] Strategy 3 (by date-time): date=${date}, start=${start}, end=${end}`);
        
        const updateResult = await Instructor.updateOne(
          {
            _id: instructorId,
            'schedule_driving_lesson.date': date,
            'schedule_driving_lesson.start': start,
            'schedule_driving_lesson.end': end
          },
          {
            $set: {
              [`schedule_driving_lesson.$[slot].status`]: setFields.status,
              ...(setFields.paid !== undefined ? { [`schedule_driving_lesson.$[slot].paid`]: setFields.paid } : {}),
              ...(setFields.paymentId ? { [`schedule_driving_lesson.$[slot].paymentId`]: setFields.paymentId } : {}),
              ...(setFields.confirmedAt ? { [`schedule_driving_lesson.$[slot].confirmedAt`]: setFields.confirmedAt } : {})
            }
          },
          {
            arrayFilters: [{ 
              "slot.date": date,
              "slot.start": start,
              "slot.end": end
            }]
          }
        );
        
        totalModified += updateResult.modifiedCount;
        console.log(`🎯 [DRIVING LESSON UPDATE] Strategy 3 result: ${updateResult.modifiedCount} slots updated`);
      }
    }

    // Populate updateResults for transparency
    for (const id of slotsToUpdate) {
      updateResults.push({ slotId: id, modified: totalModified > 0 });
    }

    if (totalModified > 0) {
      console.log(`✅ [DRIVING LESSON UPDATE] Updated ${totalModified} driving lesson slots successfully`);
      return NextResponse.json({
        success: true,
        message: `${totalModified} driving lesson slot(s) updated successfully`,
        modifiedCount: totalModified,
        results: updateResults
      });
    } else {
      console.log('❌ [DRIVING LESSON UPDATE] No driving lesson slots were updated - slots not found');
      return NextResponse.json(
        { error: "Driving lesson slots not found or already updated" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ [DRIVING LESSON UPDATE] Error updating driving lesson status:', (error as any)?.message || error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
