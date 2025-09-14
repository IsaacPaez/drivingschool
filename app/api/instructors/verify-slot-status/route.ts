import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { slotId, instructorId, classType } = await req.json();
    
    if (!slotId || !instructorId) {
      return NextResponse.json(
        { error: "Missing required fields: slotId, instructorId" },
        { status: 400 }
      );
    }

    // Determine if it's a driving test based on classType
    const isDrivingTest = classType === 'driving_test' || classType === 'driving test';
    const scheduleField = isDrivingTest ? 'schedule_driving_test' : 'schedule_driving_lesson';

    console.log(`🔍 VERIFYING slot ${slotId} for instructor ${instructorId}, classType: ${classType}`);
    console.log(`📋 Search parameters: slotId="${slotId}", isDrivingTest=${isDrivingTest}, scheduleField="${scheduleField}"`);

    // Try to find in User collection (instructors)
    let instructor = await User.findById(instructorId);
    let slot: any = null;

    if (instructor) {
      console.log(`✅ Found instructor in User collection`);
      
      if (isDrivingTest) {
        // For driving tests, try multiple matching strategies
        const schedule = instructor.get(scheduleField) || [];
        
        // Strategy 1: Try to match by _id directly
        slot = schedule.find((s: any) => s._id && s._id.toString() === slotId);
        console.log(`🎯 Strategy 1 (by _id): ${slot ? 'FOUND' : 'NOT FOUND'} - Searched ${schedule.length} slots`);
        
        // Strategy 2: If not found, try date-start-end format (generated slotId like "2025-09-20-09:00-11:00")
        if (!slot && slotId.includes('-')) {
          const parts = slotId.split('-');
          if (parts.length >= 5) {
            const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const start = parts[3];
            const end = parts[4];
            
            slot = schedule.find((s: any) => 
              s.date === date && s.start === start && s.end === end
            );
            console.log(`🎯 Strategy 2 (by date-time): ${slot ? 'FOUND' : 'NOT FOUND'} - Looking for ${date} ${start}-${end}`);
          }
        }
        
        // Strategy 3: If still not found, try to match by the studentId and date-time (in case slotId has extra info)
        if (!slot) {
          slot = schedule.find((s: any) => 
            s.status === 'pending' && 
            s.studentId && 
            slotId.includes(s.date) && 
            slotId.includes(s.start)
          );
        }
      } else {
        // For driving lessons, match by _id
        const schedule = instructor.get(scheduleField) || [];
        slot = schedule.find((s: any) => s._id && s._id.toString() === slotId);
      }
    }

    // Fallback: Try Instructor collection
    if (!slot) {
      instructor = await Instructor.findById(instructorId);
      
      if (instructor) {
        console.log(`✅ Found instructor in Instructor collection`);
        
        if (isDrivingTest) {
          // For driving tests, try multiple matching strategies
          const schedule = instructor.get(scheduleField) || [];
          
          // Strategy 1: Try to match by _id directly
          slot = schedule.find((s: any) => s._id && s._id.toString() === slotId);
          
          // Strategy 2: If not found, try date-start-end format (generated slotId like "2025-09-20-09:00-11:00")
          if (!slot && slotId.includes('-')) {
            const parts = slotId.split('-');
            if (parts.length >= 5) {
              const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
              const start = parts[3];
              const end = parts[4];
              
              slot = schedule.find((s: any) => 
                s.date === date && s.start === start && s.end === end
              );
            }
          }
          
          // Strategy 3: If still not found, try to match by the studentId and date-time (in case slotId has extra info)
          if (!slot) {
            slot = schedule.find((s: any) => 
              s.status === 'pending' && 
              s.studentId && 
              slotId.includes(s.date) && 
              slotId.includes(s.start)
            );
          }
        } else {
          // For driving lessons, match by _id
          const schedule = instructor.get(scheduleField) || [];
          slot = schedule.find((s: any) => s._id && s._id.toString() === slotId);
        }
      }
    }

    if (!slot) {
      console.log(`❌ Slot ${slotId} not found in either collection`);
      return NextResponse.json({
        found: false,
        status: 'not_found',
        paid: false,
        message: 'Slot not found'
      });
    }

    console.log(`✅ Slot ${slotId} found with status: ${slot.status}, paid: ${slot.paid}`);

    return NextResponse.json({
      found: true,
      status: slot.status,
      paid: slot.paid || false,
      studentId: slot.studentId,
      paymentId: slot.paymentId,
      confirmedAt: slot.confirmedAt,
      slotDetails: {
        date: slot.date,
        start: slot.start,
        end: slot.end,
        classType: slot.classType || classType
      }
    });

  } catch (error) {
    console.error('❌ Error verifying slot status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        found: false,
        status: 'error',
        paid: false
      },
      { status: 500 }
    );
  }
}
