import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import { broadcastDrivingLessonsUpdate } from '@/lib/sse-broadcast';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      productId,
      selectedSlots,
      selectedHours,
      pickupLocation,
      dropoffLocation,
      paymentMethod,
      studentName
    } = await request.json();

    console.log('📋 Schedule request received:', {
      userId,
      productId,
      selectedSlots: Array.from(selectedSlots),
      selectedSlotsType: typeof selectedSlots,
      selectedSlotsIsArray: Array.isArray(selectedSlots),
      selectedHours,
      pickupLocation,
      dropoffLocation,
      paymentMethod,
      studentName
    });

    if (!userId || !productId || !selectedSlots || selectedSlots.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get student information if not provided
    let finalStudentName = studentName;
    if (!finalStudentName) {
      const student = await User.findById(userId);
      if (student) {
        finalStudentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
      }
    }

    console.log('👤 Final student name:', finalStudentName);

    // Find all instructors that have the selected slots
    const instructorsToUpdate: Array<{
      instructorId: string;
      instructorName: string;
      date: string;
      start: string;
      end: string;
    }> = [];
    
    for (const slotKey of selectedSlots) {
      // Parse slot format: '2025-07-21-09:00-11:00-instructorId' (new format with instructorId)
      // Also support old format: '2025-07-21-09:00-11:00' for backwards compatibility
      const matchWithInstructor = slotKey.match(/^(\d{4}-\d{2}-\d{2})-(\d{1,2}:\d{2})-(\d{1,2}:\d{2})-([a-f0-9]{24})$/i);
      const matchOldFormat = slotKey.match(/^(\d{4}-\d{2}-\d{2})-(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);

      let parsedDate: string, parsedStart: string, parsedEnd: string, specificInstructorId: string | null = null;

      if (matchWithInstructor) {
        // New format with instructorId
        [, parsedDate, parsedStart, parsedEnd, specificInstructorId] = matchWithInstructor;
        console.log('🔍 Looking for slot (new format with instructorId):', {
          originalSlotKey: slotKey,
          date: parsedDate,
          start: parsedStart,
          end: parsedEnd,
          instructorId: specificInstructorId
        });
      } else if (matchOldFormat) {
        // Old format without instructorId (backwards compatibility)
        [, parsedDate, parsedStart, parsedEnd] = matchOldFormat;
        console.log('🔍 Looking for slot (old format):', {
          originalSlotKey: slotKey,
          date: parsedDate,
          start: parsedStart,
          end: parsedEnd
        });
      } else {
        console.error('❌ Invalid slot format:', slotKey);
        continue;
      }

      // Find instructor with this specific slot in schedule_driving_lesson
      // If we have a specific instructorId, use it; otherwise find any instructor with this slot
      let instructor;
      if (specificInstructorId) {
        // Find the SPECIFIC instructor that was selected
        instructor = await Instructor.findOne({
          _id: specificInstructorId,
          'schedule_driving_lesson': {
            $elemMatch: {
              date: parsedDate,
              start: parsedStart,
              end: parsedEnd,
              status: 'available'
            }
          }
        });
      } else {
        // Fallback: Find any instructor with this slot (old behavior)
        instructor = await Instructor.findOne({
          'schedule_driving_lesson': {
            $elemMatch: {
              date: parsedDate,
              start: parsedStart,
              end: parsedEnd,
              status: 'available'
            }
          }
        });
      }

      if (instructor) {
        console.log('✅ Found instructor for slot:', {
          instructorName: instructor.name,
          instructorId: instructor._id.toString(),
          specificInstructorRequested: specificInstructorId
        });
        instructorsToUpdate.push({
          instructorId: instructor._id.toString(),
          instructorName: instructor.name,
          date: parsedDate,
          start: parsedStart,
          end: parsedEnd
        });
      } else {
        console.error('❌ NO instructor found for slot:', {
          date: parsedDate,
          start: parsedStart,
          end: parsedEnd,
          specificInstructorId: specificInstructorId,
          slotKey: slotKey
        });
      }
    }

    console.log('📝 Instructors to update:', {
      count: instructorsToUpdate.length,
      instructors: instructorsToUpdate
    });

    if (instructorsToUpdate.length === 0) {
      console.error('❌ CRITICAL: No available slots found after checking all selectedSlots:', {
        totalSlotsRequested: selectedSlots.length,
        slotsChecked: selectedSlots
      });
      return NextResponse.json(
        { error: 'No available slots found. The selected time slots may have been booked by another user.' },
        { status: 404 }
      );
    }

    // Update each slot to pending status with request information
    for (const slot of instructorsToUpdate) {
      console.log('🔄 Updating slot:', slot);
      
      // Use updateMany to ensure we only update the exact slot that matches all criteria
      const updateResult = await Instructor.updateOne(
        {
          _id: slot.instructorId,
          'schedule_driving_lesson': {
            $elemMatch: {
              date: slot.date,
              start: slot.start,
              end: slot.end,
              status: 'available'
            }
          }
        },
        {
          $set: {
            'schedule_driving_lesson.$.status': 'pending',
            'schedule_driving_lesson.$.studentId': userId,
            'schedule_driving_lesson.$.studentName': finalStudentName,
            'schedule_driving_lesson.$.selectedProduct': productId,
            'schedule_driving_lesson.$.pickupLocation': pickupLocation,
            'schedule_driving_lesson.$.dropoffLocation': dropoffLocation,
            'schedule_driving_lesson.$.paymentMethod': paymentMethod,
            'schedule_driving_lesson.$.requestDate': new Date(),
            'schedule_driving_lesson.$.reservedAt': new Date(),
            'schedule_driving_lesson.$.paid': false
          }
        }
      );

      console.log('✅ Update result:', updateResult);
      
      // Broadcast the schedule update for this instructor (driving lessons)
      try {
        await broadcastDrivingLessonsUpdate(slot.instructorId);
      } catch (broadcastError) {
        console.warn('⚠️ Failed to broadcast driving lessons schedule update:', broadcastError);
      }
    }

    // NOTE: Do NOT add to user.driving_lesson_bookings here!
    // Bookings are only added when payment is completed successfully in payment-success
    // For "Pay at Location", the slot stays as "pending" until payment is made
    console.log('✅ Triggered driving lessons update for instructor:', instructorsToUpdate.map(s => s.instructorId).join(', '));

    return NextResponse.json({
      success: true,
      message: 'Driving lesson slots marked as pending',
      slotsUpdated: instructorsToUpdate.length,
      instructors: instructorsToUpdate
    });

  } catch (error) {
    console.error('❌ Error creating schedule request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
