import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('id');
  const classType = searchParams.get('classType');

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
      console.log(`🔄 Starting SSE stream for instructor ${instructorId} with class type ${classType}`);
      
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const fetchAndSendSchedule = async () => {
        try {
          await connectDB();
          console.log(`🔄 Fetching classes for instructor: ${instructorId}, classType: ${classType}`);
          
          // 1. Build query for instructor and class type
          let query: any = {
            instructorId: new mongoose.Types.ObjectId(instructorId)
          };

          // 2. Filter by class type if specified
          if (classType && classType !== 'ALL') {
            if (classType === 'A.D.I') query.type = 'adi';
            else if (classType === 'B.D.I') query.type = 'bdi';
            else if (classType === 'D.A.T.E') query.type = 'date';
          } else {
            // For ALL, show only adi, bdi, and date classes
            query.type = { $in: ['adi', 'bdi', 'date'] };
          }
          
          // 3. Get all ticket classes from database  
          const ticketClasses = await TicketClass.find(query);
          console.log(`📅 Found ${ticketClasses.length} classes`);
          console.log(`🔍 Query used:`, JSON.stringify(query));
          
          // Debug: Log first few classes
          if (ticketClasses.length > 0) {
            console.log(`🔍 Sample class data:`, {
              id: ticketClasses[0]._id,
              type: ticketClasses[0].type,
              date: ticketClasses[0].date,
              hour: ticketClasses[0].hour,
              endhour: ticketClasses[0].endhour,
              instructorId: ticketClasses[0].instructorId
            });
          }

          if (ticketClasses.length === 0) {
            sendEvent({
              type: 'initial',
              schedule: []
            });
            return;
          }

          // 4. Process each class and group by date
          const scheduleMap: Record<string, any[]> = {};
          
          ticketClasses.forEach(ticketClass => {
            // Get date in YYYY-MM-DD format
            const dateStr = ticketClass.date.toISOString().split('T')[0];
            
            // Initialize date array if doesn't exist
            if (!scheduleMap[dateStr]) {
              scheduleMap[dateStr] = [];
            }
            
            // Get start and end times directly from database
            const startTime = ticketClass.hour;      // hora de inicio
            let endTime = ticketClass.endhour;       // hora final
            
            // Skip if missing start time
            if (!startTime) {
              console.log(`⚠️ Skipping class ${ticketClass._id} - missing start time`);
              return;
            }
            
            // If no endhour, create a default end time (start + 1 hour)
            if (!endTime) {
              const [hours, minutes] = startTime.split(':').map(Number);
              const endHours = Math.min(hours + 1, 23);  // Default 1 hour duration, max 23:59
              endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              console.log(`📝 No endhour for class ${ticketClass._id}, using calculated: ${endTime}`);
            } else {
              console.log(`📝 Using database endhour for class ${ticketClass._id}: ${endTime}`);
            }
            
            // Normalize class type for frontend
            let classTypeDisplay = ticketClass.type;
            if (ticketClass.type === 'adi') classTypeDisplay = 'A.D.I';
            else if (ticketClass.type === 'bdi') classTypeDisplay = 'B.D.I';
            else if (ticketClass.type === 'date') classTypeDisplay = 'D.A.T.E';
            
            // Create slot for calendar
            const slot = {
              _id: ticketClass._id.toString(),
              start: startTime,
              end: endTime,
              status: 'available',
              classType: classTypeDisplay,
              ticketClassId: ticketClass._id.toString(),
              booked: false
            };
            
            scheduleMap[dateStr].push(slot);
            console.log(`✅ Added ${classTypeDisplay} class: ${dateStr} ${startTime}-${endTime}`);
          });

          // 5. Convert to final schedule format
          const schedule = Object.entries(scheduleMap).map(([date, slots]) => ({
            date,
            slots: slots.sort((a, b) => {
              const timeA = a.start.split(':').map(Number);
              const timeB = b.start.split(':').map(Number);
              return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
            })
          }));

          console.log(`📊 Final schedule: ${schedule.length} days, ${schedule.reduce((total, day) => total + day.slots.length, 0)} total classes`);

          sendEvent({
            type: 'initial',
            schedule
          });

        } catch (error) {
          console.error('❌ Error fetching schedule:', error);
          sendEvent({
            type: 'error',
            message: 'Failed to fetch schedule data'
          });
        }
      };

      // Helper function to convert time to minutes for sorting
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
