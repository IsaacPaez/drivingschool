import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    console.log("🔍 Checking transaction status:", body);

    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    // Buscar la transacción por orderId
    const transaction = await Transaction.findOne({ 
      orderIdFromApp: orderId 
    });

    // También buscar todas las transacciones para este orderId para debugging
    const allTransactions = await Transaction.find({ 
      orderIdFromApp: orderId 
    });
    
    if (allTransactions.length > 1) {
      console.log("⚠️ Multiple transactions found for orderId:", orderId);
      console.log("📊 Transaction count:", allTransactions.length);
      allTransactions.forEach((t, index) => {
        console.log(`Transaction ${index + 1}:`, {
          _id: t._id,
          orderId: t.orderId,
          status: t.status,
          resultMessage: t.resultMessage,
          createdAt: t.createdAt
        });
      });
    }

    if (!transaction) {
      console.log("⚠️ No transaction found for orderId:", orderId);
      return NextResponse.json({
        success: false,
        message: "No transaction found",
        status: "not_found"
      });
    }

    console.log("📊 Transaction found:", {
      orderId: transaction.orderId,
      status: transaction.status,
      resultMessage: transaction.resultMessage
    });

    // Verificar si la transacción está aprobada
    if (transaction.status === "APPROVED" || transaction.resultMessage === "APPROVAL") {
      console.log("✅ Transaction is APPROVED, updating order status");
      
      // Buscar la orden primero para verificar su estado actual
      const order = await Order.findById(orderId);
      if (!order) {
        console.log("❌ Order not found:", orderId);
        return NextResponse.json({
          success: false,
          message: "Order not found",
          transactionStatus: transaction.status
        });
      }

      // Solo actualizar si no está ya completada
      if (order.paymentStatus === "completed" && order.estado === "completed") {
        console.log("✅ Order already completed, no update needed");
        return NextResponse.json({
          success: true,
          message: "Order already completed",
          transactionStatus: transaction.status,
          orderStatus: "completed"
        });
      }
      
      // Use the new update-status endpoint to handle order completion and instructor updates
      const updateResponse = await fetch(`${req.nextUrl.origin}/api/orders/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "completed",
          paymentStatus: "completed"
        }),
      });

      if (updateResponse.ok) {
        console.log("✅ Order status updated to completed via update-status endpoint");
        
        return NextResponse.json({
          success: true,
          message: "Order updated to completed",
          transactionStatus: transaction.status,
          orderStatus: "completed"
        });
      } else {
        console.log("⚠️ Failed to update order");
        return NextResponse.json({
          success: false,
          message: "Failed to update order",
          transactionStatus: transaction.status
        });
      }
    } else {
      console.log("⏳ Transaction is not approved yet:", transaction.status);
      return NextResponse.json({
        success: false,
        message: "Transaction not approved yet",
        transactionStatus: transaction.status,
        resultMessage: transaction.resultMessage
      });
    }

  } catch (error) {
    console.error("❌ Error checking transaction status:", error);
    return NextResponse.json(
      { error: "Failed to check transaction status", details: error.message },
      { status: 500 }
    );
  }
}
