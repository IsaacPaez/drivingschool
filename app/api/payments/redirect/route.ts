import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Order from '@/models/Order';

const BASE_URL = "https://driving-school-mocha.vercel.app";
const EC2_URL = "http://3.149.101.8:3000";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    if (!userId) {
      console.warn("❌ No userId in query");
      return NextResponse.redirect(`${BASE_URL}/login`);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn("❌ User not found:", userId);
      return NextResponse.redirect(`${BASE_URL}/login`);
    }

    let items, total, payload, orderToUse;
    if (orderId) {
      // Reintento: usar la orden pendiente
      orderToUse = await Order.findById(orderId);
      if (!orderToUse) {
        return NextResponse.redirect(`${BASE_URL}/cart?error=order-not-found`);
      }
      items = orderToUse.items;
      total = orderToUse.total;
    } else {
      // Primer intento: usar el carrito
      const cart = await Cart.findOne({ userId });
      if (!cart || !cart.items.length) {
        console.warn("❌ Empty cart for user:", userId);
        return NextResponse.redirect(`${BASE_URL}/cart?error=empty`);
      }
      items = cart.items;
      total = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
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
      items
    };

    //console.log("📦 Enviando datos de pago a EC2:", payload);  // Log de los datos enviados al backend

    const ec2Response = await fetch(`${EC2_URL}/api/payments/session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!ec2Response.ok) {
      const errorText = await ec2Response.text();
      console.error("[API][session-token] ❌ Respuesta de error de EC2:", errorText);
      throw new Error(`EC2 error: ${ec2Response.status}`);
    }

    const responseData = await ec2Response.json();
    //console.log("[API][session-token] ✅ Token recibido desde EC2:", responseData);  // Log de la respuesta de EC2

    const token = responseData.token;

    if (!token || typeof token !== "string") {
      console.error("❌ Token inválido o ausente de EC2:", responseData);
      throw new Error("Invalid token received from EC2");
    }

    // Verificar el token antes de redirigir
    //console.log("✅ Redirigiendo a ConvergePay con el token:", token);
    // URL de cancelación con userId y orderId para reintento
    const cancelUrl = `${BASE_URL}/payment-retry?userId=${userId}&orderId=${orderId || (orderToUse ? orderToUse._id : undefined)}`;
    const hostedUrl = `https://api.demo.convergepay.com/hosted-payments?ssl_txn_auth_token=${token}&ssl_result_cancel_url=${encodeURIComponent(cancelUrl)}`;

    // Solo crear la orden y vaciar el carrito si es el primer intento
    if (!orderId) {
      // Calcular el siguiente número de orden para el usuario
      const lastOrder = await Order.findOne({ userId }).sort({ orderNumber: -1 });
      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
      const createdOrder = await Order.create({
        userId,
        items,
        total: Number(total.toFixed(2)),
        estado: 'pending',
        createdAt: new Date(),
        orderNumber: nextOrderNumber,
      });
      // Vaciar el carrito del usuario en la base de datos
      await Cart.deleteOne({ userId });
    }

    return NextResponse.json({ redirectUrl: hostedUrl });

  } catch (error) {
    console.error("[API][session-token] Error no manejado:", error);
    return NextResponse.json({ error: "payment", message: "There was an error processing the payment." }, { status: 500 });
  }
}
