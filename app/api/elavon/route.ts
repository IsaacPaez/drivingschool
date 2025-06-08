import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  await connectDB();
  const { amount, items, userId } = await req.json();

  // Validar el total en el backend
  const backendTotal = items && Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)
    : amount;

  if (items && parseFloat(backendTotal) !== parseFloat(amount)) {
    return NextResponse.json({ error: "Cart total mismatch." }, { status: 400 });
  }

  // Buscar usuario en la base de datos
  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  let userDoc = await User.findById(userId);
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const user = userDoc.toObject();

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
        ssl_amount: amount,
        ssl_first_name: user.firstName,
        ssl_last_name: user.lastName,
        ssl_company: "",
        ssl_avs_address: user.streetAddress,
        ssl_city: user.city,
        ssl_state: user.state,
        ssl_avs_zip: user.zipCode,
        ssl_country: "US",
        ssl_email: user.email,
        ssl_phone: user.phoneNumber,
        ssl_description: items.map((i: any) => i.title).join(", ") || "Purchase",
        ssl_customer_code: user.dni || "",
        ssl_salestax: "",
        ssl_get_token: "Y",
        ssl_add_token: "Y",
        ssl_invoice_number: `INV-${Date.now()}`,
        ssl_result_return_url: "https://driving-school-mocha.vercel.app/payment-success",
        ssl_result_cancel_url: "https://driving-school-mocha.vercel.app/payment-cancel",
      },
    }),
  });

  // Log de depuración
  console.log("ConvergePay response status:", response.status);
  const token = await response.text();
  console.log("ConvergePay response body:", token);
  // Validar que el token recibido sea válido (no vacío, no contenga 'error', y tenga longitud razonable)
  if (!token || token.toLowerCase().includes("error") || token.length < 10) {
    return NextResponse.json({ error: "Token generation failed.", details: token }, { status: 500 });
  }
  return NextResponse.json({ token });
}