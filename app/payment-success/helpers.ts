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
      const enrollResponse = await fetch('/api/ticketclasses/enroll-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketClassId: appointment.ticketClassId,
          studentId: userId,
          orderId: orderId,
          orderNumber: orderNumber
        })
      });

      if (!enrollResponse.ok) {
        allProcessed = false;
      }
    } catch (_error) {
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
        classType: data.classType,
        slotIds: data.slotIds
      };
      const slotUpdateResponse = await fetch('/api/instructors/update-slot-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!slotUpdateResponse.ok) {
        allProcessed = false;
      }
    } catch (_error) {
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
        const directUpdateResponse = await fetch('/api/instructors/update-slot-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: appointment.slotId,
            instructorId: appointment.instructorId,
            status: 'booked',
            paid: true,
            paymentId: orderId,
            confirmedAt: new Date().toISOString(),
            classType: appointment.classType || order.orderType
          })
        });
        if (!directUpdateResponse.ok) {
          allSlotsUpdated = false;
        }
      } catch (_error) {
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
        await fetch('/api/register-online/cancel-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketClassId: appointment.ticketClassId,
            userId: studentIdToRevert
          })
        });
      } else if ((appointment.classType === 'driving_lesson' || appointment.classType === 'driving_test') && appointment.slotId) {
        await fetch('/api/instructors/update-slot-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: appointment.slotId,
            instructorId: appointment.instructorId,
            status: 'available',
            paid: false,
            paymentId: null,
            confirmedAt: null,
            classType: appointment.classType
          })
        });
      }
    } catch (_error) {
      // continue best-effort
    }
  }
}


