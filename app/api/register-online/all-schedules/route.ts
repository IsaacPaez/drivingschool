import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import Instructor, { IInstructor } from '@/models/Instructor';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('id');

  if (!instructorId) {
    return NextResponse.json({ error: 'Missing instructor ID' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(instructorId)) {
    return NextResponse.json({ error: 'Invalid instructor ID' }, { status: 400 });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log(`🔄 Starting optimized SSE stream for instructor ${instructorId} - ALL CLASSES`);
      
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const fetchAndSendAllSchedules = async () => {
        try {
          await connectDB();
          
          // First, get all ticket classes for this instructor
          const ticketClasses = await TicketClass.find({
            instructorId: new mongoose.Types.ObjectId(instructorId)
          }).lean();

          console.log(`📅 Found ${ticketClasses.length} total ticket classes for instructor ${instructorId}`);
          
          if (ticketClasses.length > 0) {
            console.log('🔍 Sample ticket class:', JSON.stringify(ticketClasses[0], null, 2));
          }

          // Then, get the instructor's schedule to check status
          const instructor = await Instructor.findById(instructorId).lean() as IInstructor | null;
          
          if (!instructor) {
            console.log('❌ Instructor not found');
            sendEvent({
              type: 'complete',
              adi: [],
              bdi: [],
              date: []
            });
            return;
          }

          console.log(`📋 Found instructor schedule with ${instructor.schedule?.length || 0} entries`);

          if (ticketClasses.length === 0) {
            console.log('❌ No ticket classes found, sending empty schedules');
            sendEvent({
              type: 'complete',
              adi: [],
              bdi: [],
              date: []
            });
            return;
          }

          // Create a map of ticketClassId to schedule status
          const scheduleStatusMap = new Map();
          if (instructor && instructor.schedule && Array.isArray(instructor.schedule)) {
            instructor.schedule.forEach((scheduleEntry: any) => {
              if (scheduleEntry.ticketClassId) {
                scheduleStatusMap.set(scheduleEntry.ticketClassId.toString(), scheduleEntry);
              }
            });
          }

          console.log(`🗺️ Created status map with ${scheduleStatusMap.size} entries`);

          // Group by class type
          const scheduleByType: Record<string, Record<string, any[]>> = {
            'adi': {},
            'bdi': {},
            'date': {}
          };

          ticketClasses.forEach((ticketClass: any) => {
            const classType = ticketClass.type.toLowerCase(); // adi, bdi, date
            console.log(`🔍 Processing ticket class with type: ${classType}`);
            
            if (!scheduleByType[classType]) {
              console.log(`⚠️ Unknown class type: ${classType}, skipping...`);
              return;
            }

            const dateStr = ticketClass.date.toISOString().split('T')[0];
            if (!scheduleByType[classType][dateStr]) {
              scheduleByType[classType][dateStr] = [];
            }

            // Get status from instructor schedule
            const scheduleEntry = scheduleStatusMap.get(ticketClass._id.toString());
            const status = scheduleEntry ? scheduleEntry.status : 'available';
            const booked = scheduleEntry ? scheduleEntry.booked : false;
            const studentId = scheduleEntry ? scheduleEntry.studentId : null;
            
            // Create slot combining ticket class info with schedule status
            const slot = {
              _id: scheduleEntry?._id?.toString() || ticketClass._id.toString(),
              date: dateStr,
              start: ticketClass.hour,
              end: ticketClass.endHour || getEndTime(ticketClass.hour, ticketClass.duration),
              status: status,
              classType: ticketClass.type,
              ticketClassId: ticketClass._id.toString(),
              booked: booked,
              studentId: studentId,
              amount: scheduleEntry?.amount || null,
              paid: scheduleEntry?.paid || false,
              pickupLocation: scheduleEntry?.pickupLocation || "",
              dropoffLocation: scheduleEntry?.dropoffLocation || ""
            };
            
            scheduleByType[classType][dateStr].push(slot);
            console.log(`✅ Added ${classType} slot on ${dateStr}: ${slot.start}-${slot.end} (${slot.status})`);
          });

          // Convert to array format for each type
          const finalSchedules = {
            adi: Object.entries(scheduleByType['adi'] || {}).map(([date, slots]) => ({
              date,
              slots: slots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
            })),
            bdi: Object.entries(scheduleByType['bdi'] || {}).map(([date, slots]) => ({
              date,
              slots: slots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
            })),
            date: Object.entries(scheduleByType['date'] || {}).map(([date, slots]) => ({
              date,
              slots: slots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
            }))
          };

          console.log('📊 Schedules by type:', {
            adi: Object.keys(scheduleByType['adi'] || {}).length,
            bdi: Object.keys(scheduleByType['bdi'] || {}).length, 
            date: Object.keys(scheduleByType['date'] || {}).length
          });

          console.log('🎯 Final schedules being sent:', JSON.stringify(finalSchedules, null, 2));

          sendEvent({
            type: 'complete',
            ...finalSchedules
          });

        } catch (error) {
          console.error('❌ Error fetching complete schedule:', error);
          sendEvent({
            type: 'error',
            message: 'Failed to fetch schedule data'
          });
        }
      };

      // Helper function to get end time based on start time and duration
      const getEndTime = (startTime: string, duration: string) => {
        if (!startTime || !duration) return startTime;
        
        const [hours, minutes] = startTime.split(':').map(Number);
        const durationHours = parseInt(duration.replace('h', '')) || 2;
        const endHours = hours + durationHours;
        return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };

      // Helper function to convert time to minutes
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      // Send initial data
      fetchAndSendAllSchedules();

      // Set up periodic updates every 30 seconds
      const interval = setInterval(fetchAndSendAllSchedules, 30000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`🔌 SSE connection closed for instructor ${instructorId}`);
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, { headers });
}
