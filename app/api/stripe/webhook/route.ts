import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  console.log("📩 Webhook recibido en el servidor");

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ No se encontró la firma de Stripe");
    return NextResponse.json({ error: "No Stripe Signature" }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
    console.log(`✅ Webhook recibido: ${event.type}`);
    console.log("🔍 Evento completo:", JSON.stringify(event, null, 2));
  } catch (err: any) {
    console.error("⚠️ Error en el Webhook:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("📄 Datos de la sesión:", session);

    const db = await connectToDatabase();
    if (!db) {
      console.error("❌ No se pudo conectar a MongoDB");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    console.log("✅ Conexión a MongoDB exitosa");

    // 🔹 1️⃣ Obtener el email del cliente
    let customerEmail = session.customer_email;

    if (!customerEmail && session.customer) {
      try {
        const customer = await stripe.customers.retrieve(
          session.customer as string
        );
        console.log("📩 Cliente recuperado desde Stripe:", customer);
        if (customer && typeof customer === "object" && "email" in customer) {
          customerEmail = customer.email as string;
        }
      } catch (error) {
        console.error("❌ Error obteniendo el email del cliente:", error);
      }
    }

    // 🔹 2️⃣ Obtener los productos comprados
    let products: { name: string; price: number; quantity: number }[] = [];

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      products = lineItems.data.map((item) => ({
        name: item.description || "Unknown Product",
        price: item.amount_total ? item.amount_total / 100 : 0, // Convertir a dólares
        quantity: item.quantity || 0,
      }));
      console.log("🛒 Productos comprados:", products);
    } catch (error) {
      console.error("❌ Error obteniendo los productos comprados:", error);
    }

    // 🔹 3️⃣ Guardar los datos en MongoDB
    try {
      const insertResult = await db.collection("payments").insertOne({
        stripeSessionId: session.id,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0, // Convertir a dólares
        currency: session.currency,
        paymentStatus: session.payment_status,
        customerEmail: customerEmail || "Desconocido",
        products, // Guardar los productos comprados
        createdAt: new Date(),
      });

      console.log("✅ Información del pago guardada en MongoDB", insertResult);
    } catch (error) {
      console.error("❌ Error guardando el pago en MongoDB:", error);
    }
  }

  return NextResponse.json({ received: true });
}
