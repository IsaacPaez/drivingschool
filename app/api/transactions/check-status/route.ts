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
      
      // Actualizar la orden a "completed" y "approved"
      const updateResult = await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            paymentStatus: "completed",
            estado: "completed",
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log("✅ Order status updated to completed");
        return NextResponse.json({
          success: true,
          message: "Order updated to completed",
          transactionStatus: transaction.status,
          orderStatus: "completed"
        });
      } else {
        console.log("⚠️ Order not found or already updated");
        return NextResponse.json({
          success: false,
          message: "Order not found or already updated",
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
