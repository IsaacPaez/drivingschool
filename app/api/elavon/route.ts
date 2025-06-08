import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, items } = await req.json();

  // Validar el total en el backend
  const backendTotal = items && Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)
    : amount;

  if (items && parseFloat(backendTotal) !== parseFloat(amount)) {
    return NextResponse.json({ error: "Cart total mismatch." }, { status: 400 });
  }

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
        ssl_first_name: "John",
        ssl_last_name: "Smith",
        ssl_company: "My Company",
        ssl_avs_address: "My Address",
        ssl_city: "City",
        ssl_state: "AZ",
        ssl_avs_zip: "00000",
        ssl_country: "US",
        ssl_email: "test@example.com",
        ssl_get_token: "Y",
        ssl_add_token: "Y",
        ssl_invoice_number: `INV-${Date.now()}`,
        ssl_result_return_url: "https://driving-school-mocha.vercel.app/payment-success",
        ssl_result_cancel_url: "https://driving-school-mocha.vercel.app/payment-cancel",
      },
    }),
  });

  const token = await response.text();
  return NextResponse.json({ token });
}