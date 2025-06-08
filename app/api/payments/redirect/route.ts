import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  console.log("[API][redirect] userId received:", userId);
  if (!userId) {
    console.log("[API][redirect] No userId, redirecting to login");
    return NextResponse.redirect("/login");
  }
  const user = await User.findById(userId);
  if (!user) {
    console.log("[API][redirect] User not found, redirecting to login");
    return NextResponse.redirect("/login");
  }
  const cart = await Cart.findOne({ userId });
  if (!cart || !cart.items.length) {
    console.log("[API][redirect] Cart not found or empty for user:", userId);
    return NextResponse.redirect("/cart?error=empty");
  }
  const total = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  console.log("[API][redirect] Cart found. Total:", total, "Items:", cart.items);
  try {
    const response = await fetch("http://3.149.101.8:3000/api/payments/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "POST",
        url: "https://api.demo.convergepay.com/hosted-payments/transaction_token",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: {
          ssl_transaction_type: "ccsale",
          ssl_account_id: "0022822",
          ssl_user_id: "apiuser",
          ssl_pin: "F172ZQCH30G5SCBTVS19YBZK0XUMKQ9KBLBXI1QMXMQYAQI4J591BY5GY1PKGL1E",
          ssl_amount: total.toFixed(2),
          ssl_first_name: user.firstName,
          ssl_last_name: user.lastName,
          ssl_company: "Driving School",
          ssl_avs_address: user.streetAddress,
          ssl_city: user.city,
          ssl_state: user.state,
          ssl_avs_zip: user.zipCode,
          ssl_country: "US",
          ssl_email: user.email,
          ssl_phone: user.phoneNumber,
          ssl_description: cart.items.map((i: any) => i.title).join(", ") || "Purchase",
          ssl_customer_code: user.dni,
          ssl_salestax: "",
          ssl_get_token: "Y",
          ssl_add_token: "Y",
          ssl_invoice_number: `INV-${Date.now()}`,
          ssl_result_return_url: "https://driving-school-mocha.vercel.app/payment-success",
          ssl_result_cancel_url: "https://driving-school-mocha.vercel.app/payment-cancel",
        },
      }),
    });
    const token = await response.text();
    console.log("[API][redirect] Payment proxy response token:", token);
    return NextResponse.redirect(`https://api.demo.convergepay.com/hosted-payments?ssl_txn_auth_token=${token}`);
  } catch (error) {
    console.log("[API][redirect] Error calling payment proxy:", error);
    return NextResponse.redirect("/cart?error=payment");
  }
} 