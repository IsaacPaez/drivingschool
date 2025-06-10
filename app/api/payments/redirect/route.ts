import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";

const BASE_URL = "https://driving-school-mocha.vercel.app";
const EC2_URL = "http://3.149.101.8:3000";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.warn("❌ No userId in query");
      return NextResponse.redirect(`${BASE_URL}/login`);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn("❌ User not found:", userId);
      return NextResponse.redirect(`${BASE_URL}/login`);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      console.warn("❌ Empty cart for user:", userId);
      return NextResponse.redirect(`${BASE_URL}/cart?error=empty`);
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

    const payload = {
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
      items: cart.items
    };

    //console.log("📦 Sending payload to EC2:", payload);

    const ec2Response = await fetch(`${EC2_URL}/api/payments/session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!ec2Response.ok) {
      const errorText = await ec2Response.text();
      console.error("[API][session-token] ❌ EC2 error response:", errorText);
      throw new Error(`EC2 error: ${ec2Response.status}`);
    }

    const responseData = await ec2Response.json();
    const token = responseData.token;

    if (!token || typeof token !== "string") {
      console.error("❌ Invalid or missing token from EC2:", responseData);
      throw new Error("Invalid token received from EC2");
    }

    const hostedUrl = `https://api.demo.convergepay.com/hosted-payments?ssl_txn_auth_token=${token}`;
    console.log("✅ Redirecting to:", hostedUrl);

    return NextResponse.redirect(hostedUrl);

  } catch (error) {
    console.error("[API][session-token] Unhandled error:", error);
    return NextResponse.redirect(`${BASE_URL}/cart?error=payment`);
  }
}
