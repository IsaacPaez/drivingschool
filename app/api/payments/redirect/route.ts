import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Order from '@/models/Order';
import { startAndWaitEC2 } from "@/app/api/checkout/aws-ec2";

const BASE_URL = "https://driving-school-mocha.vercel.app";
const EC2_URL = "http://3.149.101.8:3000";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    if (!userId) {
      return NextResponse.redirect(`${BASE_URL}/login`);
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.redirect(`${BASE_URL}/login`);
    }

    let items, total, payload, orderToUse;
    if (orderId) {
      // console.log("🔍 [DEBUG] Looking for existing order:", orderId);
      // Reintento: usar la orden pendiente
      orderToUse = await Order.findById(orderId);
      if (!orderToUse) {
        // console.warn("❌ Order not found:", orderId);
        return NextResponse.redirect(`${BASE_URL}/cart?error=order-not-found`);
      }
      items = orderToUse.items;
      total = orderToUse.total;
      // console.log("✅ [DEBUG] Using existing order with", items.length, "items, total:", total);
    } else {
      // console.log("🔍 [DEBUG] Looking for cart for user:", userId);
      // Primer intento: usar el carrito
      const cart = await Cart.findOne({ userId });
      if (!cart || !cart.items.length) {
        // console.warn("❌ Empty cart for user:", userId);
        return NextResponse.redirect(`${BASE_URL}/cart?error=empty`);
      }      items = cart.items;
      total = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
      // console.log("✅ [DEBUG] Using cart with", items.length, "items, total:", total);
    }

    let finalOrderId = orderId;
    
    // Solo crear la orden y vaciar el carrito si es el primer intento
    if (!orderId) {
      // console.log("📝 [DEBUG] Creating new order...");
      // Calcular el siguiente número de orden globalmente (para todos los usuarios)
      const lastOrder = await Order.findOne({}).sort({ orderNumber: -1 });
      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
      // console.log("🔢 [DEBUG] Next order number (global):", nextOrderNumber);
      
      const createdOrder = await Order.create({
        userId,
        items,
        total: Number(total.toFixed(2)),
        estado: 'pending',
        createdAt: new Date(),
        orderNumber: nextOrderNumber,
      });
      // console.log("✅ [DEBUG] Order created successfully with ID:", createdOrder._id);
      finalOrderId = createdOrder._id.toString();
      
      // Vaciar el carrito del usuario en la base de datos
      const deleteResult = await Cart.deleteOne({ userId });
      // console.log("🗑️ [DEBUG] Cart deletion result:", deleteResult);
    } else if (orderToUse) {
      finalOrderId = orderToUse._id.toString();
    }

    payload = {
      amount: Number(total.toFixed(2)),
      firstName: user.firstName || "John",
      lastName: user.lastName || "Doe",
      email: user.email || "",
      phone: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      dni: user.dni || "",
      items,
      userId: userId,
      orderId: finalOrderId
    };

    // console.log("📦 [DEBUG] Payload to send to EC2:", JSON.stringify(payload, null, 2));

    // --- INICIO: Encender y esperar EC2 antes de pedir el token ---
    const ok = await startAndWaitEC2(process.env.EC2_INSTANCE_ID!);
    if (!ok) {
      return NextResponse.json({ 
        error: "ec2", 
        message: "No se pudo encender la instancia EC2" 
      }, { status: 500 });
    }
    // --- FIN: Encender y esperar EC2 ---

    const ec2Response = await fetch(`${EC2_URL}/api/payments/session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // console.log("🌐 [DEBUG] EC2 Response status:", ec2Response.status);
      if (!ec2Response.ok) {
      const errorText = await ec2Response.text();
      // console.error("[API][session-token] ❌ Respuesta de error de EC2:", errorText);
      throw new Error(`EC2 error: ${ec2Response.status} - ${errorText}`);
    }

    const responseData = await ec2Response.json();
    // console.log("[API][session-token] ✅ Response from EC2:", JSON.stringify(responseData, null, 2));

    const token = responseData.token;

    if (!token || typeof token !== "string") {
      // console.error("❌ Token inválido o ausente de EC2:", responseData);
      throw new Error("Invalid token received from EC2");
    }

    // console.log("✅ [DEBUG] Valid token received from EC2, length:", token.length);
    
    // Crear las URLs con el orderId correcto
    const cancelUrl = `${BASE_URL}/payment-retry?userId=${userId}&orderId=${finalOrderId}`;
    const successUrl = `${BASE_URL}/payment-success?userId=${userId}&orderId=${finalOrderId}`;
    const hostedUrl = `https://api.demo.convergepay.com/hosted-payments?ssl_txn_auth_token=${token}&ssl_result_cancel_url=${encodeURIComponent(cancelUrl)}&ssl_result_success_url=${encodeURIComponent(successUrl)}`;

    console.log("🔗 [TEMP DEBUG] Cancel URL:", cancelUrl);
    console.log("🔗 [TEMP DEBUG] Success URL:", successUrl);
    console.log("🔗 [TEMP DEBUG] Full Hosted URL:", hostedUrl);

    // console.log("🔗 [DEBUG] Returning hosted URL for redirect");
    return NextResponse.json({ redirectUrl: hostedUrl });

  } catch (error) {
    // console.error("[API][session-token] ❌ Error no manejado:", error);
    // Agregar más detalles del error
    if (error instanceof Error) {      // console.error("[API][session-token] ❌ Error message:", error.message);
      // console.error("[API][session-token] ❌ Error stack:", error.stack);
    }
    return NextResponse.json({ 
      error: "payment", 
      message: "There was an error processing the payment.", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
