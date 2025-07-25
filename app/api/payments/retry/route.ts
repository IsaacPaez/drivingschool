import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from '@/models/Order';

const BASE_URL = "https://driving-school-mocha.vercel.app";
const EC2_URL = "https://botopiapagosatldriving.xyz";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");
    if (!userId || !orderId) {
      return NextResponse.json({ error: "Missing userId or orderId" }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const order = await Order.findById(orderId);
    if (!order || order.estado !== 'pending') {
      return NextResponse.json({ error: "Order not found or not pending" }, { status: 404 });
    }    const payload = {
      amount: Number(order.total.toFixed(2)),
      firstName: user.firstName || "John",
      lastName: user.lastName || "Doe",
      email: user.email || "",
      phone: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      dni: user.dni || "",
      items: order.items,
      userId: userId,
      orderId: orderId
    };
    const ec2Response = await fetch(`${EC2_URL}/api/payments/session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!ec2Response.ok) {
      const errorText = await ec2Response.text();
      return NextResponse.json({ error: "EC2 error", details: errorText }, { status: 500 });
    }
    const responseData = await ec2Response.json();
    const token = responseData.token;
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token from EC2" }, { status: 500 });
    }    // Nueva URL de cancelación para más reintentos
    const cancelUrl = `${BASE_URL}/payment-retry?userId=${userId}&orderId=${orderId}`;
    const successUrl = `${BASE_URL}/payment-success?userId=${userId}&orderId=${orderId}`;
    const hostedUrl = `https://api.demo.convergepay.com/hosted-payments?ssl_txn_auth_token=${token}&ssl_result_cancel_url=${encodeURIComponent(cancelUrl)}&ssl_result_success_url=${encodeURIComponent(successUrl)}`;
    return NextResponse.json({ redirectUrl: hostedUrl });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
} 