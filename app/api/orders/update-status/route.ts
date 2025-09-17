import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import TicketClass from "@/models/TicketClass";

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
        console.log("🎫 Processing ticket class payment completion...");
        
        // Move students from studentRequests to students for each appointment
        const ticketClassUpdatePromises = updatedOrder.appointments.map(async (appointment: any) => {
          try {
            if (appointment.ticketClassId) {
              console.log(`🔄 Moving student from requests to enrolled for ticket class: ${appointment.ticketClassId}`);
              
              // First, find the ticket class and the student request
              const ticketClass = await TicketClass.findById(appointment.ticketClassId);
              if (!ticketClass) {
                console.error(`❌ Ticket class not found: ${appointment.ticketClassId}`);
                return { modifiedCount: 0 };
              }
              
              // Find the pending request for this user
              const studentRequest = ticketClass.studentRequests?.find(
                (req: any) => req.studentId === updatedOrder.userId.toString() && req.status === 'pending'
              );
              
              if (!studentRequest) {
                console.error(`❌ No pending request found for user ${updatedOrder.userId} in ticket class ${appointment.ticketClassId}`);
                return { modifiedCount: 0 };
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
                    students: {
                      studentId: updatedOrder.userId.toString(),
                      enrolledAt: new Date(),
                      orderId: orderId,
                      paymentStatus: 'completed',
                      ...studentRequest.classDetails
                    }
                  },
                  $inc: { enrolledStudents: 1, availableSpots: -1 },
                  $set: { updatedAt: new Date() }
                }
              );
              
              console.log(`✅ Student moved from requests to enrolled for ticket class ${appointment.ticketClassId}:`, 
                updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
              return updateResult;
            }
            return { modifiedCount: 0 };
          } catch (error) {
            console.error(`❌ Error processing ticket class ${appointment.ticketClassId}:`, error);
            return { modifiedCount: 0 };
          }
        });
        
        const ticketClassResults = await Promise.all(ticketClassUpdatePromises);
        const totalTicketClassesUpdated = ticketClassResults.reduce((sum, result) => sum + result.modifiedCount, 0);
        console.log(`✅ Total ticket classes processed: ${totalTicketClassesUpdated}`);
      }
      
      // Handle driving lesson payments
      else if (updatedOrder.orderType === 'driving_lesson') {
      console.log("🔄 Processing driving lesson payment completion...");
      
      // Get the specific instructor IDs you mentioned
      const targetInstructorIds = ['679e84fecec9a6a2cd008c7a', '68b76e08c9eb0e64de946f2f'];
      
      // Update only the specific slots that are in this order's appointments using slot IDs
      const updatePromises = updatedOrder.appointments.map(async (appointment: any) => {
        try {
          // Only update if the instructor is in our target list
          if (!targetInstructorIds.includes(appointment.instructorId)) {
            console.log(`⏭️ Skipping instructor ${appointment.instructorId} - not in target list`);
            return { modifiedCount: 0 };
          }
          
          // Use the specific slot ID if available, otherwise fall back to date/time matching
          if (appointment.slotId) {
            console.log(`🎯 [ORDERS UPDATE] Checking slot by ID: ${appointment.slotId} for instructor ${appointment.instructorId}`);
            
            // First check if slot is already booked - if so, skip update to preserve fields
            const instructor = await User.findById(appointment.instructorId);
            if (instructor && instructor.schedule_driving_lesson) {
              const existingSlot = instructor.schedule_driving_lesson.find((slot: any) => 
                slot._id.toString() === appointment.slotId
              );
              
              if (existingSlot && existingSlot.status === 'booked') {
                console.log(`✅ [ORDERS UPDATE] Slot ${appointment.slotId} already booked - SKIPPING update to preserve fields`);
                return { modifiedCount: 0 };
              }
            }
            
            console.log(`🎯 [ORDERS UPDATE] Updating slot by ID: ${appointment.slotId} for instructor ${appointment.instructorId}`);
            
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
            
            console.log(`✅ [ORDERS UPDATE] Slot ID ${appointment.slotId} update result:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
            return updateResult;
          } else {
            // Fallback to date/time matching (old method)
            console.log(`🔄 [ORDERS UPDATE] Checking slot by date/time for instructor ${appointment.instructorId}: ${appointment.date} ${appointment.start}-${appointment.end}`);
            
            // First check if slot is already booked - if so, skip update to preserve fields
            const instructor = await User.findById(appointment.instructorId);
            if (instructor && instructor.schedule_driving_lesson) {
              const existingSlot = instructor.schedule_driving_lesson.find((slot: any) => 
                slot.date === appointment.date &&
                slot.start === appointment.start &&
                slot.end === appointment.end &&
                slot.studentId === updatedOrder.userId.toString()
              );
              
              if (existingSlot && existingSlot.status === 'booked') {
                console.log(`✅ [ORDERS UPDATE] Slot by date/time already booked - SKIPPING update to preserve fields`);
                return { modifiedCount: 0 };
              }
            }
            
            console.log(`🔄 [ORDERS UPDATE] Updating slot by date/time for instructor ${appointment.instructorId}: ${appointment.date} ${appointment.start}-${appointment.end}`);
            
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
            
            console.log(`✅ Slot ${appointment.date} ${appointment.start}-${appointment.end} update result:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
            return updateResult;
          }
          
        } catch (error) {
          console.error(`❌ Error updating slot ${appointment.slotId || `${appointment.date} ${appointment.start}-${appointment.end}`}:`, error);
          return { modifiedCount: 0 };
        }
      });

      const updateResults = await Promise.all(updatePromises);
      const totalUpdated = updateResults.reduce((sum, result) => sum + result.modifiedCount, 0);
      
      console.log(`✅ Total specific slots updated: ${totalUpdated}`);
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
