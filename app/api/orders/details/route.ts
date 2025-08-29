import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching order details for:", orderId);

    // Find the order with all details
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("✅ Order found:", order.orderNumber);

    // Return complete order details
    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        appointments: order.appointments,
        packageDetails: order.packageDetails,
        items: order.items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        estado: order.estado,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details", details: error.message },
      { status: 500 }
    );
  }
}
