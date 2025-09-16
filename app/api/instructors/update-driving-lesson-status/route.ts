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

    // SIMPLE: No need to prepare complex fields - just update status
    console.log(`🔍 [DRIVING LESSON UPDATE] SIMPLE MODE: Only updating status to 'booked'`);

    let totalModified = 0;
    const updateResults: { slotId: string; modified: boolean }[] = [];

    // SIMPLE STRATEGY: Just update status to 'booked' - nothing else
    console.log(`🔍 [DRIVING LESSON UPDATE] SIMPLE STRATEGY: Just updating status to 'booked' for ${slotsToUpdate.length} slots`);
    
    for (const slotIdToUpdate of slotsToUpdate) {
      try {
        console.log(`🔍 [DRIVING LESSON UPDATE] Processing slot: ${slotIdToUpdate}`);
        
        // SIMPLE UPDATE: Only change status to 'booked'
        const updateResult = await Instructor.findOneAndUpdate(
          { 
            _id: instructorId,
            'schedule_driving_lesson._id': slotIdToUpdate
          },
          { 
            $set: { 
              'schedule_driving_lesson.$.status': 'booked'
            } 
          },
          { 
            new: true,
            runValidators: true
          }
        );
        
        if (updateResult) {
          totalModified++;
          console.log(`✅ [DRIVING LESSON UPDATE] Successfully updated slot ${slotIdToUpdate} to 'booked'`);
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