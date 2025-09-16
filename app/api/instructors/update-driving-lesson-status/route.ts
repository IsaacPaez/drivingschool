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

    // Strategy 1: ULTRA ROBUST - Update each slot individually using findOneAndUpdate with $set to preserve ALL existing fields
    if (slotsToUpdate.length > 0) {
      console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: Updating ${slotsToUpdate.length} slots individually to preserve ALL existing fields`);
      
      for (const slotIdToUpdate of slotsToUpdate) {
        try {
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: Processing slot ${slotIdToUpdate}`);
          
          // Step 1: Find the instructor and get the current slot data
          const instructor = await Instructor.findById(instructorId);
          if (!instructor) {
            console.error(`❌ [DRIVING LESSON UPDATE] ULTRA ROBUST: Instructor ${instructorId} not found`);
            continue;
          }
          
          // Step 2: Find the specific slot and get its current data
          const currentSlot = instructor.schedule_driving_lesson.find((slot: any) => 
            slot._id.toString() === slotIdToUpdate
          );
          
          if (!currentSlot) {
            console.error(`❌ [DRIVING LESSON UPDATE] ULTRA ROBUST: Slot ${slotIdToUpdate} not found in instructor's schedule`);
            continue;
          }
          
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: Current slot data BEFORE update:`, {
            _id: currentSlot._id,
            status: currentSlot.status,
            paid: currentSlot.paid,
            pickupLocation: currentSlot.pickupLocation,
            dropoffLocation: currentSlot.dropoffLocation,
            studentId: currentSlot.studentId,
            studentName: currentSlot.studentName,
            date: currentSlot.date,
            start: currentSlot.start,
            end: currentSlot.end,
            classType: currentSlot.classType,
            orderId: currentSlot.orderId,
            orderNumber: currentSlot.orderNumber,
            amount: currentSlot.amount,
            reservedAt: currentSlot.reservedAt,
            booked: currentSlot.booked
          });
          
          // Check if currentSlot is a Mongoose document or plain object
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: currentSlot type:`, typeof currentSlot);
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: currentSlot has toObject:`, typeof currentSlot.toObject);
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: Raw currentSlot:`, currentSlot);
          
          // Step 3: Create a NEW slot object with ALL existing fields + updated fields
          // Handle both Mongoose documents and plain objects
          const currentSlotData = currentSlot.toObject ? currentSlot.toObject() : currentSlot;
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: currentSlotData after conversion:`, currentSlotData);
          
          const updatedSlot = {
            ...currentSlotData, // Preserve ALL existing fields
            status: setFields.status, // Update status
            ...(setFields.paid !== undefined && { paid: setFields.paid }), // Update paid if provided
            ...(setFields.paymentId && { paymentId: setFields.paymentId }), // Add paymentId if provided
            ...(setFields.confirmedAt && { confirmedAt: setFields.confirmedAt }) // Add confirmedAt if provided
          };
          
          console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: Updated slot data AFTER merge:`, {
            _id: updatedSlot._id,
            status: updatedSlot.status,
            paid: updatedSlot.paid,
            pickupLocation: updatedSlot.pickupLocation,
            dropoffLocation: updatedSlot.dropoffLocation,
            studentId: updatedSlot.studentId,
            studentName: updatedSlot.studentName,
            date: updatedSlot.date,
            start: updatedSlot.start,
            end: updatedSlot.end,
            classType: updatedSlot.classType,
            orderId: updatedSlot.orderId,
            orderNumber: updatedSlot.orderNumber,
            amount: updatedSlot.amount,
            reservedAt: updatedSlot.reservedAt,
            booked: updatedSlot.booked
          });
          
          // CRITICAL: Check if important fields are being preserved
          const criticalFieldsCheck = {
            studentId_preserved: updatedSlot.studentId !== null && updatedSlot.studentId !== undefined && updatedSlot.studentId !== "",
            studentName_preserved: updatedSlot.studentName !== "" && updatedSlot.studentName !== null && updatedSlot.studentName !== undefined,
            pickupLocation_preserved: updatedSlot.pickupLocation !== null && updatedSlot.pickupLocation !== undefined && updatedSlot.pickupLocation !== "",
            dropoffLocation_preserved: updatedSlot.dropoffLocation !== null && updatedSlot.dropoffLocation !== undefined && updatedSlot.dropoffLocation !== "",
            selectedProduct_preserved: updatedSlot.selectedProduct !== null && updatedSlot.selectedProduct !== undefined && updatedSlot.selectedProduct !== ""
          };
          
          console.log(`🚨 [DRIVING LESSON UPDATE] ULTRA ROBUST: CRITICAL FIELD CHECK:`, criticalFieldsCheck);
          
          // Check if ALL critical fields are preserved
          const allCriticalFieldsPreserved = Object.values(criticalFieldsCheck).every(field => field === true);
          
          if (!allCriticalFieldsPreserved) {
            console.error(`❌ [DRIVING LESSON UPDATE] ULTRA ROBUST: CRITICAL FIELDS MISSING - NOT updating slot to prevent countdown start`);
            console.error(`❌ [DRIVING LESSON UPDATE] ULTRA ROBUST: Missing fields:`, {
              studentId: updatedSlot.studentId,
              studentName: updatedSlot.studentName,
              pickupLocation: updatedSlot.pickupLocation,
              dropoffLocation: updatedSlot.dropoffLocation,
              selectedProduct: updatedSlot.selectedProduct
            });
            continue; // Skip this slot update
          }
          
          console.log(`✅ [DRIVING LESSON UPDATE] ULTRA ROBUST: ALL CRITICAL FIELDS PRESERVED - Proceeding with update`);
          
          // Step 4: Use findOneAndUpdate with $set to replace the entire slot object (preserving all fields)
          const updateResult = await Instructor.findOneAndUpdate(
            { 
              _id: instructorId,
              'schedule_driving_lesson._id': slotIdToUpdate
            },
            { 
              $set: { 
                'schedule_driving_lesson.$': updatedSlot 
              } 
            },
            { 
              new: true,
              runValidators: true
            }
          );
          
          if (updateResult) {
            totalModified++;
            console.log(`✅ [DRIVING LESSON UPDATE] ULTRA ROBUST: Successfully updated slot ${slotIdToUpdate} with ALL fields preserved`);
            
            // Step 5: Verify the update by fetching the updated slot
            const verifyInstructor = await Instructor.findById(instructorId);
            const verifySlot = verifyInstructor?.schedule_driving_lesson.find((slot: any) => 
              slot._id.toString() === slotIdToUpdate
            );
            
            if (verifySlot) {
              console.log(`🔍 [DRIVING LESSON UPDATE] ULTRA ROBUST: VERIFICATION - Updated slot data:`, {
                _id: verifySlot._id,
                status: verifySlot.status,
                paid: verifySlot.paid,
                pickupLocation: verifySlot.pickupLocation,
                dropoffLocation: verifySlot.dropoffLocation,
                studentId: verifySlot.studentId,
                studentName: verifySlot.studentName,
                date: verifySlot.date,
                start: verifySlot.start,
                end: verifySlot.end,
                classType: verifySlot.classType
              });
            }
          } else {
            console.error(`❌ [DRIVING LESSON UPDATE] ULTRA ROBUST: Failed to update slot ${slotIdToUpdate} - no modifications made`);
          }
        } catch (error) {
          console.error(`❌ [DRIVING LESSON UPDATE] ULTRA ROBUST: Error updating slot ${slotIdToUpdate}:`, error);
        }
      }
      
      console.log(`🎯 [DRIVING LESSON UPDATE] ULTRA ROBUST: Individual slot processing complete: ${totalModified}/${slotsToUpdate.length} slots updated`);
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
