import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { slotId, instructorId, status, paid, paymentId, confirmedAt, classType } = await req.json();

    console.log('🔄 [FORCE UPDATE] Updating slot status:', {
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
    
    console.log(`🔍 [FORCE UPDATE] Looking for ${isDrivingTest ? 'driving test' : 'driving lesson'} slot in ${scheduleField}`);
    
    // Find the instructor - try Instructor model first
    let instructor = await Instructor.findById(instructorId);
    let updateResult;
    
    if (instructor) {
      console.log('✅ [FORCE UPDATE] Found instructor in Instructor collection');
      
      if (isDrivingTest) {
        // Strategy 1: Try to update by _id directly (in case slotId is the actual _id)
        updateResult = await Instructor.updateOne(
          {
            _id: instructorId,
            [`${scheduleField}._id`]: slotId
          },
          {
            $set: {
              [`${scheduleField}.$.status`]: status,
              [`${scheduleField}.$.paid`]: paid,
              [`${scheduleField}.$.paymentId`]: paymentId,
              [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
              [`${scheduleField}.$.booked`]: status === 'booked'
            }
          }
        );
        
        console.log(`🎯 [FORCE UPDATE] Strategy 1 (by _id): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
        
        // Strategy 2: If not found, try date-time format (format: "2025-09-11-07:30-09:30")
        if (updateResult.modifiedCount === 0 && slotId.includes('-')) {
          const parts = slotId.split('-');
          if (parts.length >= 5) {
            const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const start = parts[3];
            const end = parts[4];
            
            console.log(`🔍 [FORCE UPDATE] Strategy 2 - Searching driving test slot: date=${date}, start=${start}, end=${end}`);
            
            updateResult = await Instructor.updateOne(
              {
                _id: instructorId,
                [`${scheduleField}.date`]: date,
                [`${scheduleField}.start`]: start,
                [`${scheduleField}.end`]: end
              },
              {
                $set: {
                  [`${scheduleField}.$.status`]: status,
                  [`${scheduleField}.$.paid`]: paid,
                  [`${scheduleField}.$.paymentId`]: paymentId,
                  [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
                  [`${scheduleField}.$.booked`]: status === 'booked'
                }
              }
            );
            
            console.log(`🎯 [FORCE UPDATE] Strategy 2 (by date-time): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
          }
        }
        
        // Strategy 3: If still not found, try to find by status=pending and date matching
        if (updateResult.modifiedCount === 0 && slotId.includes('-')) {
          const parts = slotId.split('-');
          if (parts.length >= 5) {
            const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const start = parts[3];
            
            console.log(`🔍 [FORCE UPDATE] Strategy 3 - Searching pending slot with date=${date}, start=${start}`);
            
            updateResult = await Instructor.updateOne(
              {
                _id: instructorId,
                [`${scheduleField}.date`]: date,
                [`${scheduleField}.start`]: start,
                [`${scheduleField}.status`]: 'pending'
              },
              {
                $set: {
                  [`${scheduleField}.$.status`]: status,
                  [`${scheduleField}.$.paid`]: paid,
                  [`${scheduleField}.$.paymentId`]: paymentId,
                  [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
                  [`${scheduleField}.$.booked`]: status === 'booked'
                }
              }
            );
            
            console.log(`🎯 [FORCE UPDATE] Strategy 3 (by pending + date): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
          }
        }
      } else {
        // For driving lessons, use slotId directly
        updateResult = await Instructor.updateOne(
          {
            _id: instructorId,
            [`${scheduleField}._id`]: slotId
          },
          {
            $set: {
              [`${scheduleField}.$.status`]: status,
              [`${scheduleField}.$.paid`]: paid,
              [`${scheduleField}.$.paymentId`]: paymentId,
              [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
              [`${scheduleField}.$.studentName`]: status === 'available' ? 'Available' : 'Confirmed'
            }
          }
        );
      }
    } else {
      // Try User model
      instructor = await User.findById(instructorId);
      if (instructor) {
        console.log('✅ [FORCE UPDATE] Found instructor in User collection');
        
        if (isDrivingTest) {
          // Strategy 1: Try to update by _id directly (in case slotId is the actual _id)
          updateResult = await User.updateOne(
            {
              _id: instructorId,
              [`${scheduleField}._id`]: slotId
            },
            {
              $set: {
                [`${scheduleField}.$.status`]: status,
                [`${scheduleField}.$.paid`]: paid,
                [`${scheduleField}.$.paymentId`]: paymentId,
                [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
                [`${scheduleField}.$.booked`]: status === 'booked'
              }
            }
          );
          
          console.log(`🎯 [FORCE UPDATE] User Strategy 1 (by _id): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
          
          // Strategy 2: If not found, try date-time format (format: "2025-09-11-07:30-09:30")
          if (updateResult.modifiedCount === 0 && slotId.includes('-')) {
            const parts = slotId.split('-');
            if (parts.length >= 5) {
              const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
              const start = parts[3];
              const end = parts[4];
              
              console.log(`🔍 [FORCE UPDATE] User Strategy 2 - Searching driving test slot: date=${date}, start=${start}, end=${end}`);
              
              updateResult = await User.updateOne(
                {
                  _id: instructorId,
                  [`${scheduleField}.date`]: date,
                  [`${scheduleField}.start`]: start,
                  [`${scheduleField}.end`]: end
                },
                {
                  $set: {
                    [`${scheduleField}.$.status`]: status,
                    [`${scheduleField}.$.paid`]: paid,
                    [`${scheduleField}.$.paymentId`]: paymentId,
                    [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
                    [`${scheduleField}.$.booked`]: status === 'booked'
                  }
                }
              );
              
              console.log(`🎯 [FORCE UPDATE] User Strategy 2 (by date-time): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
            }
          }
          
          // Strategy 3: If still not found, try to find by status=pending and date matching
          if (updateResult.modifiedCount === 0 && slotId.includes('-')) {
            const parts = slotId.split('-');
            if (parts.length >= 5) {
              const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
              const start = parts[3];
              
              console.log(`🔍 [FORCE UPDATE] User Strategy 3 - Searching pending slot with date=${date}, start=${start}`);
              
              updateResult = await User.updateOne(
                {
                  _id: instructorId,
                  [`${scheduleField}.date`]: date,
                  [`${scheduleField}.start`]: start,
                  [`${scheduleField}.status`]: 'pending'
                },
                {
                  $set: {
                    [`${scheduleField}.$.status`]: status,
                    [`${scheduleField}.$.paid`]: paid,
                    [`${scheduleField}.$.paymentId`]: paymentId,
                    [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
                    [`${scheduleField}.$.booked`]: status === 'booked'
                  }
                }
              );
              
              console.log(`🎯 [FORCE UPDATE] User Strategy 3 (by pending + date): ${updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO MATCH'}`);
            }
          }
        } else {
          // For driving lessons in User model
          updateResult = await User.updateOne(
            {
              _id: instructorId,
              [`${scheduleField}._id`]: slotId
            },
            {
              $set: {
                [`${scheduleField}.$.status`]: status,
                [`${scheduleField}.$.paid`]: paid,
                [`${scheduleField}.$.paymentId`]: paymentId,
                [`${scheduleField}.$.confirmedAt`]: confirmedAt ? new Date(confirmedAt) : null,
                [`${scheduleField}.$.studentName`]: status === 'available' ? 'Available' : 'Confirmed'
              }
            }
          );
        }
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
