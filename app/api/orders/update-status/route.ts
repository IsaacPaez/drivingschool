import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

// Type definitions for better type safety
interface OrderAppointment {
  slotId?: string;
  instructorId?: string;
  ticketClassId?: string;
  date: string;
  start: string;
  end: string;
  classType: string;
  amount: number;
  status: string;
}

interface StudentRequest {
  studentId: mongoose.Types.ObjectId;
  requestDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
  paymentMethod?: 'online' | 'local';
  reason?: string;
  classDetails?: {
    classId?: string;
    date?: string;
    start?: string;
    end?: string;
  };
}

interface ScheduleSlot {
  _id: mongoose.Types.ObjectId;
  date: string;
  start: string;
  end: string;
  status: string;
  studentId?: string;
}

interface EnrolledStudent {
  studentId: string;
  enrolledAt: Date;
  orderId: string;
  paymentStatus: string;
  reason?: string;
  classId?: string;
  date?: string;
  start?: string;
  end?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { orderId, status, paymentStatus } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        estado: status,
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // If payment is completed, handle different order types
    if (paymentStatus === 'completed') {

      // Handle ticket class payments
      if (updatedOrder.orderType === 'ticket_class' || updatedOrder.orderType === 'package_class') {
        // Move students from studentRequests to students for each appointment
        const ticketClassUpdatePromises = updatedOrder.appointments.map(async (appointment: OrderAppointment) => {
          try {
            if (appointment.ticketClassId) {
              // First, find the ticket class and the student request
              const ticketClass = await TicketClass.findById(appointment.ticketClassId);
              if (!ticketClass) {
                return { modifiedCount: 0 };
              }

              // Find the pending request for this user (convert ObjectId to string for comparison)
              const studentRequest = ticketClass.studentRequests?.find(
                (req: StudentRequest) => req.studentId?.toString() === updatedOrder.userId.toString() && req.status === 'pending'
              );

              if (!studentRequest) {
                return { modifiedCount: 0 };
              }

              // Build the enrolled student object
              const enrolledStudent: EnrolledStudent = {
                studentId: updatedOrder.userId.toString(),
                enrolledAt: new Date(),
                orderId: orderId,
                paymentStatus: 'completed',
                ...studentRequest.classDetails
              };

              // Copy reason from studentRequest if it exists
              if (studentRequest.reason) {
                enrolledStudent.reason = studentRequest.reason;
              }

              // Move student from requests to enrolled students
              const updateResult = await TicketClass.updateOne(
                { _id: appointment.ticketClassId },
                {
                  $pull: {
                    studentRequests: {
                      studentId: updatedOrder.userId.toString(),
                      status: 'pending'
                    }
                  },
                  $push: {
                    students: enrolledStudent
                  },
                  $inc: { enrolledStudents: 1, availableSpots: -1 },
                  $set: { updatedAt: new Date() }
                }
              );

              return updateResult;
            }
            return { modifiedCount: 0 };
          } catch (error) {
            console.error(`Error processing ticket class ${appointment.ticketClassId}:`, error);
            return { modifiedCount: 0 };
          }
        });

        await Promise.all(ticketClassUpdatePromises);
      }

      // Handle driving lesson payments
      else if (updatedOrder.orderType === 'driving_lesson') {
        // Get the specific instructor IDs
        const targetInstructorIds = ['679e84fecec9a6a2cd008c7a', '68b76e08c9eb0e64de946f2f'];

        // Update only the specific slots that are in this order's appointments using slot IDs
        const updatePromises = updatedOrder.appointments.map(async (appointment: OrderAppointment) => {
          try {
            // Only update if the instructor is in our target list
            if (!appointment.instructorId || !targetInstructorIds.includes(appointment.instructorId)) {
              return { modifiedCount: 0 };
            }

            // Use the specific slot ID if available, otherwise fall back to date/time matching
            if (appointment.slotId) {
              // First check if slot is already booked - if so, skip update to preserve fields
              const instructor = await User.findById(appointment.instructorId);
              if (instructor?.schedule_driving_lesson) {
                const existingSlot = instructor.schedule_driving_lesson.find((slot: ScheduleSlot) =>
                  slot._id.toString() === appointment.slotId
                );

                if (existingSlot && existingSlot.status === 'booked') {
                  return { modifiedCount: 0 };
                }
              }

              const updateResult = await User.updateOne(
                {
                  _id: appointment.instructorId,
                  'schedule_driving_lesson._id': appointment.slotId,
                  'schedule_driving_lesson.status': 'pending'
                },
                {
                  $set: {
                    'schedule_driving_lesson.$.status': 'booked',
                    'schedule_driving_lesson.$.paid': true,
                    'schedule_driving_lesson.$.paymentId': orderId,
                    'schedule_driving_lesson.$.confirmedAt': new Date()
                  }
                }
              );

              return updateResult;
            } else {
              // Fallback to date/time matching (old method)
              // First check if slot is already booked - if so, skip update to preserve fields
              const instructor = await User.findById(appointment.instructorId);
              if (instructor?.schedule_driving_lesson) {
                const existingSlot = instructor.schedule_driving_lesson.find((slot: ScheduleSlot) =>
                  slot.date === appointment.date &&
                  slot.start === appointment.start &&
                  slot.end === appointment.end &&
                  slot.studentId === updatedOrder.userId.toString()
                );

                if (existingSlot && existingSlot.status === 'booked') {
                  return { modifiedCount: 0 };
                }
              }

              const updateResult = await User.updateOne(
                {
                  _id: appointment.instructorId,
                  'schedule_driving_lesson': {
                    $elemMatch: {
                      date: appointment.date,
                      start: appointment.start,
                      end: appointment.end,
                      studentId: updatedOrder.userId.toString(),
                      status: 'pending'
                    }
                  }
                },
                {
                  $set: {
                    'schedule_driving_lesson.$.status': 'booked',
                    'schedule_driving_lesson.$.paid': true,
                    'schedule_driving_lesson.$.paymentId': orderId,
                    'schedule_driving_lesson.$.confirmedAt': new Date()
                  }
                }
              );

              return updateResult;
            }

          } catch (error) {
            console.error(`Error updating slot ${appointment.slotId || `${appointment.date} ${appointment.start}-${appointment.end}`}:`, error);
            return { modifiedCount: 0 };
          }
        });

        await Promise.all(updatePromises);
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
