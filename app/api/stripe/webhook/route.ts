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
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // 🔹 1️⃣ Obtener el email del cliente
    let customerEmail = session.customer_email;

    if (!customerEmail && session.customer) {
      try {
        const customer = await stripe.customers.retrieve(
          session.customer as string
        );
        if (customer && typeof customer === "object" && "email" in customer) {
          customerEmail = customer.email as string;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          return NextResponse.json({ error: `Error retrieving customer email: ${err.message}` }, { status: 500 });
        }
        return NextResponse.json({ error: "Error retrieving customer email" }, { status: 500 });
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        return NextResponse.json({ error: `Error retrieving purchased products: ${err.message}` }, { status: 500 });
      }
      return NextResponse.json({ error: "Error retrieving purchased products" }, { status: 500 });
    }

    // 🔹 3️⃣ Guardar los datos en MongoDB
    try {
      await db.collection("payments").insertOne({
        stripeSessionId: session.id,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0, // Convertir a dólares
        currency: session.currency,
        paymentStatus: session.payment_status,
        customerEmail: customerEmail || "Desconocido",
        products, // Guardar los productos comprados
        createdAt: new Date(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return NextResponse.json({ error: `Error saving payment to database: ${err.message}` }, { status: 500 });
      }
      return NextResponse.json({ error: "Error saving payment to database" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
