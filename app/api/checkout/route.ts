import { NextResponse } from "next/server";
import Stripe from "stripe";
import { startAndWaitEC2 } from "./aws-ec2";

// Definir la interfaz CartItem dentro de este archivo
interface CartItem {
  title: string;
  price: number;
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("❌ STRIPE_SECRET_KEY no está definida en .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    // 1. Enciende la instancia EC2 y espera a que esté lista
    const ok = await startAndWaitEC2(process.env.EC2_INSTANCE_ID!);
    if (!ok) {
      return new Response("No se pudo encender la instancia EC2", { status: 500 });
    }

    // 2. Aquí va tu lógica para solicitar el token de Elavon
    // const token = await getElavonToken();

    // 3. Continúa con el proceso de checkout
    return new Response("Instancia encendida y token solicitado", { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Error creando la sesión de pago",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
