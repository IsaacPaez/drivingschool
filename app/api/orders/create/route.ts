import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    console.log("📝 Creating order with data:", body);

    const { 
      userId, 
      orderType, 
      appointments, 
      packageDetails, 
      items,
      total, 
      paymentMethod 
    } = body;

    // Validation
    if (!userId || !orderType || !appointments || appointments.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: userId, orderType, or appointments" },
        { status: 400 }
      );
    }

    // Generate order number manually as fallback
    const orderCount = await Order.countDocuments();
    const generatedOrderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Create the order
    const order = new Order({
      userId,
      orderType,
      orderNumber: generatedOrderNumber, // Set manually to ensure it's always present
      appointments: appointments.map((apt: any) => ({
        slotId: apt.slotId || `${apt.date}-${apt.start}-${apt.end}`,
        instructorId: apt.instructorId,
        instructorName: apt.instructorName,
        date: apt.date,
        start: apt.start,
        end: apt.end,
        classType: apt.classType,
        amount: apt.amount,
        status: 'pending'
      })),
      packageDetails: packageDetails || {},
      items: items || [],
      total,
      paymentMethod: paymentMethod || 'online',
      paymentStatus: 'pending',
      estado: 'pending'
    });

    const savedOrder = await order.save();
    console.log("✅ Order created successfully:", savedOrder._id, savedOrder.orderNumber);

    // Update instructor schedules to mark slots as pending with order reference
    const updatePromises = appointments.map(async (apt: any) => {
      try {
        console.log(`🔄 Updating instructor ${apt.instructorId} schedule for ${apt.classType}`);
        
        const scheduleField = apt.classType === 'driving_test' ? 'schedule_driving_test' : 'schedule_driving_lesson';
        
        const updateResult = await Instructor.updateOne(
          {
            _id: apt.instructorId,
            [`${scheduleField}.date`]: apt.date,
            [`${scheduleField}.start`]: apt.start,
            [`${scheduleField}.end`]: apt.end
          },
          {
            $set: {
              [`${scheduleField}.$.status`]: 'pending',
              [`${scheduleField}.$.studentId`]: userId,
              [`${scheduleField}.$.studentName`]: 'Pending Payment',
              [`${scheduleField}.$.orderId`]: savedOrder._id.toString(),
              [`${scheduleField}.$.orderNumber`]: savedOrder.orderNumber,
              [`${scheduleField}.$.reservedAt`]: new Date()
            }
          }
        );
        
        console.log(`✅ Updated instructor ${apt.instructorId} schedule:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
        return updateResult;
        
      } catch (error) {
        console.error(`❌ Error updating instructor ${apt.instructorId} schedule:`, error);
        throw error;
      }
    });

    await Promise.all(updatePromises);
    console.log("✅ All instructor schedules updated successfully");

    return NextResponse.json({
      success: true,
      order: {
        _id: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        total: savedOrder.total,
        orderType: savedOrder.orderType,
        appointments: savedOrder.appointments,
        packageDetails: savedOrder.packageDetails,
        createdAt: savedOrder.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
