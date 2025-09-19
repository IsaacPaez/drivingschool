import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get('instructorId');

  if (!instructorId) {
    return new Response('Instructor ID is required', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      sendInitialData(controller, encoder, instructorId);

      // Set up interval for periodic updates (every 30 seconds)
      const interval = setInterval(async () => {
        try {
          await sendScheduleUpdate(controller, encoder, instructorId);
        } catch (error) {
          console.error('Error in SSE interval:', error);
        }
      }, 30000);

      // Cleanup function
      return () => {
        clearInterval(interval);
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

async function sendInitialData(controller: ReadableStreamDefaultController, encoder: TextEncoder, instructorId: string) {
  try {
    await connectDB();
    
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      const errorData = `data: ${JSON.stringify({ type: 'error', message: 'Instructor not found' })}\n\n`;
      controller.enqueue(encoder.encode(errorData));
      return;
    }

    const schedule = instructor.schedule_driving_test || [];
    console.log(`📡 Sending initial driving test schedule for instructor ${instructorId}:`, schedule.length, 'slots');

    const data = `data: ${JSON.stringify({ 
      type: 'initial', 
      schedule: schedule,
      instructorId: instructorId 
    })}\n\n`;
    
    controller.enqueue(encoder.encode(data));
  } catch (error) {
    console.error('Error sending initial data:', error);
    const errorData = `data: ${JSON.stringify({ type: 'error', message: 'Failed to load schedule' })}\n\n`;
    controller.enqueue(encoder.encode(errorData));
  }
}

async function sendScheduleUpdate(controller: ReadableStreamDefaultController, encoder: TextEncoder, instructorId: string) {
  try {
    await connectDB();
    
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return;
    }

    const schedule = instructor.schedule_driving_test || [];
    console.log(`📡 Sending driving test schedule update for instructor ${instructorId}:`, schedule.length, 'slots');

    const data = `data: ${JSON.stringify({ 
      type: 'update', 
      schedule: schedule,
      instructorId: instructorId 
    })}\n\n`;
    
    controller.enqueue(encoder.encode(data));
  } catch (error) {
    console.error('Error sending schedule update:', error);
  }
}
