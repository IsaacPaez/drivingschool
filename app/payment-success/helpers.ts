// Helper types
export interface OrderDetails {
  orderNumber: string;
  total: number;
}

export interface Appointment {
  ticketClassId?: string;
  classType?: string;
  slotId?: string;
  instructorId?: string;
  date?: string;
  start?: string;
  end?: string;
}

export interface OrderDataShape {
  orderType: string;
  userId?: string;
  appointments?: Appointment[];
}

// Helpers: API Calls
export async function fetchOrderDetails(orderId: string): Promise<{ order: OrderDataShape & OrderDetails } | null> {
  const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
  if (!orderResponse.ok) return null;
  return orderResponse.json();
}

export async function processTicketClasses(appointments: Appointment[], userId: string, orderId: string, orderNumber?: string): Promise<boolean> {
  let allProcessed = true;
  for (const appointment of appointments) {
    try {
      // Use the new specific route for ticket classes
      const updateResponse = await fetch('/api/ticketclasses/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketClassId: appointment.ticketClassId,
          studentId: userId,
          status: 'confirmed',
          paymentId: orderId,
          orderId: orderId
        })
      });

      if (!updateResponse.ok) {
        console.error(`❌ Failed to update ticket class status for ${appointment.ticketClassId}`);
        allProcessed = false;
      } else {
        console.log(`✅ Successfully updated ticket class status for ${appointment.ticketClassId}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ticket class ${appointment.ticketClassId}:`, error);
      allProcessed = false;
    }
  }
  return allProcessed;
}

export type DrivingLessonGroup = {
  instructorId: string;
  classType: string;
  slotIds: string[];
};

export function groupDrivingLessonsByInstructor(drivingLessons: Appointment[]): Record<string, DrivingLessonGroup> {
  return drivingLessons.reduce((acc: Record<string, DrivingLessonGroup>, apt: Appointment) => {
    const key = String(apt.instructorId);
    if (!acc[key]) {
      acc[key] = { instructorId: String(apt.instructorId), classType: String(apt.classType), slotIds: [] };
    }
    if (apt.slotId) acc[key].slotIds.push(apt.slotId);
    return acc;
  }, {});
}

export async function updateInstructorSlotsBatch(grouped: Record<string, DrivingLessonGroup>, orderId: string): Promise<boolean> {
  let allProcessed = true;
  for (const [instructorId, data] of Object.entries(grouped)) {
    try {
      const payload = {
        instructorId: instructorId,
        status: 'booked',
        paid: true,
        paymentId: orderId,
        slotIds: data.slotIds
      };

      // Use specific route based on class type
      const isDrivingTest = data.classType === 'driving_test';
      const endpoint = isDrivingTest ? '/api/instructors/update-driving-test-status' : '/api/instructors/update-driving-lesson-status';
      
      console.log(`🎯 Using ${isDrivingTest ? 'driving test' : 'driving lesson'} specific route: ${endpoint}`);
      
      const slotUpdateResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!slotUpdateResponse.ok) {
        console.error(`❌ Failed to update ${isDrivingTest ? 'driving test' : 'driving lesson'} slots for instructor ${instructorId}`);
        allProcessed = false;
      } else {
        console.log(`✅ Successfully updated ${isDrivingTest ? 'driving test' : 'driving lesson'} slots for instructor ${instructorId}`);
      }
    } catch (error) {
      console.error(`❌ Error updating slots for instructor ${instructorId}:`, error);
      allProcessed = false;
    }
  }
  return allProcessed;
}

export async function forceUpdateLegacySlots(order: OrderDataShape, orderId: string): Promise<boolean> {
  let allSlotsUpdated = true;
  for (const appointment of order.appointments || []) {
    if (appointment.slotId) {
      try {
        const isDrivingTest = appointment.classType === 'driving_test' || order.orderType === 'driving_test';
        const endpoint = isDrivingTest ? '/api/instructors/update-driving-test-status' : '/api/instructors/update-driving-lesson-status';
        
        console.log(`🎯 [LEGACY] Using ${isDrivingTest ? 'driving test' : 'driving lesson'} specific route: ${endpoint}`);
        
        const directUpdateResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: appointment.slotId,
            instructorId: appointment.instructorId,
            status: 'booked',
            paid: true,
            paymentId: orderId
          })
        });
        
        if (!directUpdateResponse.ok) {
          console.error(`❌ [LEGACY] Failed to update ${isDrivingTest ? 'driving test' : 'driving lesson'} slot ${appointment.slotId}`);
          allSlotsUpdated = false;
        } else {
          console.log(`✅ [LEGACY] Successfully updated ${isDrivingTest ? 'driving test' : 'driving lesson'} slot ${appointment.slotId}`);
        }
      } catch (error) {
        console.error(`❌ [LEGACY] Error updating slot ${appointment.slotId}:`, error);
        allSlotsUpdated = false;
      }
    }
  }
  return allSlotsUpdated;
}

export async function revertAppointmentsOnFailure(order: OrderDataShape, userId?: string | null): Promise<void> {
  for (const appointment of order.appointments || []) {
    try {
      if (appointment.classType === 'ticket_class' || appointment.ticketClassId) {
        const studentIdToRevert = userId || order.userId;
        
        // Use the new specific route for ticket classes
        await fetch('/api/ticketclasses/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketClassId: appointment.ticketClassId,
            studentId: studentIdToRevert,
            status: 'cancelled'
          })
        });
        
        console.log(`🔄 Reverted ticket class ${appointment.ticketClassId} for student ${studentIdToRevert}`);
        
      } else if ((appointment.classType === 'driving_lesson' || appointment.classType === 'driving_test') && appointment.slotId) {
        const isDrivingTest = appointment.classType === 'driving_test';
        const endpoint = isDrivingTest ? '/api/instructors/update-driving-test-status' : '/api/instructors/update-driving-lesson-status';
        
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: appointment.slotId,
            instructorId: appointment.instructorId,
            status: 'available',
            paid: false,
            paymentId: null
          })
        });
        
        console.log(`🔄 Reverted ${isDrivingTest ? 'driving test' : 'driving lesson'} slot ${appointment.slotId}`);
      }
    } catch (error) {
      console.error(`❌ Error reverting appointment:`, error);
      // continue best-effort
    }
  }
}


