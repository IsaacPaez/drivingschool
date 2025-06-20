import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Webhook received from Converge");
    
    const body = await req.text();
    console.log("📋 Raw webhook body:", body);
    
    // Parse URL-encoded data
    const params = new URLSearchParams(body);
    const webhookData: any = {};
    
    for (const [key, value] of params.entries()) {
      webhookData[key] = value;
    }
    
    console.log("📦 Parsed webhook data:", webhookData);
    
    const {
      ssl_result,
      ssl_customer_code,
      ssl_txn_id,
      ssl_amount
    } = webhookData;
      // Extraer userId y orderId del customer_code
    let userId = null;
    let orderId = null;
    if (ssl_customer_code && ssl_customer_code.length >= 16) {
      // El customer_code ahora tiene formato: últimos8digitsUserId + últimos8digitsOrderId
      const userPart = ssl_customer_code.slice(0, 8);
      const orderPart = ssl_customer_code.slice(8, 16);
      
      console.log('👤 User part:', userPart);
      console.log('📦 Order part:', orderPart);
      
      // Por ahora usar los fragmentos directamente
      userId = userPart;
      orderId = orderPart;
    }
    
    console.log("👤 Extracted userId:", userId);
    console.log("📦 Extracted orderId:", orderId);
    console.log("✅ Payment result:", ssl_result);
    
    // Actualizar el estado de la orden si el pago fue exitoso
    if (ssl_result === '0' || ssl_result === 0) {
      console.log("✅ Payment successful");
      
      if (orderId) {
        // Actualizar el estado de la orden
        const updateResponse = await fetch(`${req.nextUrl.origin}/api/orders/update-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            status: "completed"
          }),
        });
        
        console.log("📝 Order update response:", updateResponse.status);
      }
    }
    
    // Siempre responder con 200 OK para que Converge no reintente
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully'
    });
    
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    
    // Aún así responder con 200 para evitar reintentos
    return NextResponse.json({ 
      status: 'error',
      message: 'Error processing webhook'
    });
  }
}

export async function GET(req: NextRequest) {
  // Para testing del webhook
  return NextResponse.json({ message: "Webhook endpoint is active" });
}
