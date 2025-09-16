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

    // NEW STRATEGY: Update each slot individually using findOneAndUpdate
    console.log(`🔍 [DRIVING LESSON UPDATE] NEW STRATEGY: Updating ${slotsToUpdate.length} slots individually`);
    
    for (const slotIdToUpdate of slotsToUpdate) {
      try {
        console.log(`🔍 [DRIVING LESSON UPDATE] Processing slot: ${slotIdToUpdate}`);
        
        // First, let's see what slots exist
        const currentInstructor = await Instructor.findById(instructorId);
        if (currentInstructor && currentInstructor.schedule_driving_lesson) {
          const existingSlot = currentInstructor.schedule_driving_lesson.find((slot: any) => 
            slot._id.toString() === slotIdToUpdate
          );
          
          if (existingSlot) {
            console.log(`🔍 [DRIVING LESSON UPDATE] Found existing slot:`, {
              _id: existingSlot._id,
              date: existingSlot.date,
              start: existingSlot.start,
              end: existingSlot.end,
              status: existingSlot.status,
              studentId: existingSlot.studentId,
              studentName: existingSlot.studentName,
              pickupLocation: existingSlot.pickupLocation,
              dropoffLocation: existingSlot.dropoffLocation,
              selectedProduct: existingSlot.selectedProduct
            });
          } else {
            console.log(`❌ [DRIVING LESSON UPDATE] Slot ${slotIdToUpdate} not found in instructor's schedule`);
            continue;
          }
        }
        
        // Update using findOneAndUpdate with $set to preserve all existing fields
        const updateResult = await Instructor.findOneAndUpdate(
          { 
            _id: instructorId,
            'schedule_driving_lesson._id': slotIdToUpdate
          },
          { 
            $set: { 
              'schedule_driving_lesson.$.status': setFields.status,
              ...(setFields.paid !== undefined && { 'schedule_driving_lesson.$.paid': setFields.paid }),
              ...(setFields.paymentId && { 'schedule_driving_lesson.$.paymentId': setFields.paymentId }),
              ...(setFields.confirmedAt && { 'schedule_driving_lesson.$.confirmedAt': setFields.confirmedAt })
            } 
          },
          { 
            new: true,
            runValidators: true
          }
        );
        
        if (updateResult) {
          totalModified++;
          console.log(`✅ [DRIVING LESSON UPDATE] Successfully updated slot ${slotIdToUpdate}`);
          
          // Verify the update
          const verifyInstructor = await Instructor.findById(instructorId);
          const verifySlot = verifyInstructor?.schedule_driving_lesson.find((slot: any) => 
            slot._id.toString() === slotIdToUpdate
          );
          
          if (verifySlot) {
            console.log(`🔍 [DRIVING LESSON UPDATE] VERIFICATION - Updated slot:`, {
              _id: verifySlot._id,
              status: verifySlot.status,
              paid: verifySlot.paid,
              studentId: verifySlot.studentId,
              studentName: verifySlot.studentName,
              pickupLocation: verifySlot.pickupLocation,
              dropoffLocation: verifySlot.dropoffLocation,
              selectedProduct: verifySlot.selectedProduct
            });
          }
        } else {
          console.error(`❌ [DRIVING LESSON UPDATE] Failed to update slot ${slotIdToUpdate}`);
        }
      } catch (error) {
        console.error(`❌ [DRIVING LESSON UPDATE] Error updating slot ${slotIdToUpdate}:`, error);
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