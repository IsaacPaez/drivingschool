import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

// Global map to track active connections and their intervals
const activeConnections = new Map<string, {
  interval: NodeJS.Timeout | null;
  isActive: boolean;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  instructorId: string;
}>();

// Global function to broadcast updates to all active connections for an instructor
export function broadcastScheduleUpdate(instructorId: string) {
  console.log(`📢 Broadcasting schedule update for instructor ${instructorId}`);

  for (const [connectionId, connection] of activeConnections.entries()) {
    if (connection.instructorId === instructorId && connection.isActive) {
      try {
        sendScheduleUpdate(connection.controller, connection.encoder, instructorId, connectionId);
      } catch (error) {
        console.error(`❌ Failed to broadcast to connection ${connectionId}:`, error);
        connection.isActive = false;
      }
    }
  }
}

async function sendScheduleUpdate(controller: ReadableStreamDefaultController, encoder: TextEncoder, instructorId: string, connectionId: string) {
  try {
    // Check if connection is still active
    const connection = activeConnections.get(connectionId);
    if (!connection || !connection.isActive) {
      console.log(`⏭️ Connection ${connectionId} inactive, skipping schedule update`);
      return;
    }

    await connectDB();

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      console.log(`❌ Instructor ${instructorId} not found for update`);
      return;
    }

    const schedule = instructor.schedule_driving_test || [];
    console.log(`📡 Sending driving test schedule update for instructor ${instructorId} (${connectionId}):`, schedule.length, 'slots');

    const data = `data: ${JSON.stringify({
      type: 'update',
      schedule: schedule,
      instructorId: instructorId
    })}\n\n`;

    // Safe send with double-check
    if (connection.isActive && controller.desiredSize !== null) {
      try {
        controller.enqueue(encoder.encode(data));
      } catch (enqueueError) {
        console.log(`⚠️ Failed to send update data for ${connectionId}:`, enqueueError);
        connection.isActive = false;
        throw enqueueError; // Re-throw to trigger interval cleanup
      }
    } else {
      console.log(`⏭️ Controller closed or connection inactive for ${connectionId}, skipping update`);
      connection.isActive = false;
      throw new Error('Connection no longer active');
    }
  } catch (error) {
    console.error(`❌ Error sending schedule update for ${connectionId}:`, error);
    const connection = activeConnections.get(connectionId);
    if (connection) {
      connection.isActive = false;
    }
    throw error; // Re-throw to trigger interval cleanup
  }
}

// Export the connections map for use in the route
export { activeConnections, sendScheduleUpdate };