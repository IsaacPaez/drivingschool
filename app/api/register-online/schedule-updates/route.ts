import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('id');
  const classType = searchParams.get('classType');

  if (!instructorId || !classType) {
    return NextResponse.json({ error: 'Missing instructor ID or class type' }, { status: 400 });
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
      console.log(`🔄 Starting SSE stream for instructor ${instructorId} with class type ${classType}`);
      
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const fetchAndSendSchedule = async () => {
        try {
          await connectDB();
          
          // Find ticket classes for this instructor and class type
          const ticketClasses = await TicketClass.find({
            instructorId: new mongoose.Types.ObjectId(instructorId),
            type: classType
          });

          console.log(`📅 Found ${ticketClasses.length} ticket classes for instructor ${instructorId} with class type ${classType}`);

          if (ticketClasses.length === 0) {
            sendEvent({
              type: 'initial',
              schedule: []
            });
            return;
          }

          // Group ticket classes by date
          const scheduleMap: Record<string, any[]> = {};
          
          ticketClasses.forEach(ticketClass => {
            const dateStr = ticketClass.date.toISOString().split('T')[0];
            if (!scheduleMap[dateStr]) {
              scheduleMap[dateStr] = [];
            }
            
            // Create slot from ticket class
            const slot = {
              _id: ticketClass._id.toString(),
              start: ticketClass.hour,
              end: getEndTime(ticketClass.hour, ticketClass.duration),
              status: getSlotStatus(ticketClass),
              classType: ticketClass.type,
              ticketClassId: ticketClass._id.toString(),
              booked: ticketClass.students && ticketClass.students.length > 0,
              studentId: ticketClass.students && ticketClass.students.length > 0 ? ticketClass.students[0].studentId : undefined
            };
            
            scheduleMap[dateStr].push(slot);
          });

          // Convert to array format
          const schedule = Object.entries(scheduleMap).map(([date, slots]) => ({
            date,
            slots: slots.sort((a, b) => {
              const timeA = timeToMinutes(a.start);
              const timeB = timeToMinutes(b.start);
              return timeA - timeB;
            })
          }));

          sendEvent({
            type: 'initial',
            schedule
          });

        } catch (error) {
          console.error('❌ Error fetching register schedule:', error);
          sendEvent({
            type: 'error',
            message: 'Failed to fetch schedule data'
          });
        }
      };

      // Helper function to get end time based on start time and duration
      const getEndTime = (startTime: string, duration: string) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const durationHours = parseInt(duration.replace('h', '')) || 1;
        const endHours = hours + durationHours;
        return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };

      // Helper function to determine slot status
      const getSlotStatus = (ticketClass: any) => {
        if (ticketClass.students && ticketClass.students.length > 0) {
          return 'scheduled';
        }
        return 'available';
      };

      // Helper function to convert time to minutes
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      // Send initial data
      fetchAndSendSchedule();

      // Set up periodic updates every 30 seconds
      const interval = setInterval(fetchAndSendSchedule, 30000);

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
