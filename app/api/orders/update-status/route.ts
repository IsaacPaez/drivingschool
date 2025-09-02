import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

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

    // If payment is completed and order type is driving lesson, update instructor schedules
    if (paymentStatus === 'completed' && updatedOrder.orderType === 'driving_lesson') {
      console.log("🔄 Processing driving lesson payment completion...");
      
      // Get the specific instructor IDs you mentioned
      const targetInstructorIds = ['679e84fecec9a6a2cd008c7a', '68b76e08c9eb0e64de946f2f'];
      
      // Update only the specific slots that are in this order's appointments
      const updatePromises = updatedOrder.appointments.map(async (appointment: any) => {
        try {
          // Only update if the instructor is in our target list
          if (!targetInstructorIds.includes(appointment.instructorId)) {
            console.log(`⏭️ Skipping instructor ${appointment.instructorId} - not in target list`);
            return { modifiedCount: 0 };
          }
          
          console.log(`🔄 Updating specific slot for instructor ${appointment.instructorId}: ${appointment.date} ${appointment.start}-${appointment.end}`);
          
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
          
        } catch (error) {
          console.error(`❌ Error updating slot ${appointment.date} ${appointment.start}-${appointment.end}:`, error);
          return { modifiedCount: 0 };
        }
      });

      const updateResults = await Promise.all(updatePromises);
      const totalUpdated = updateResults.reduce((sum, result) => sum + result.modifiedCount, 0);
      
      console.log(`✅ Total specific slots updated: ${totalUpdated}`);
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
