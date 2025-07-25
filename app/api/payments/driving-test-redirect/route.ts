import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { startAndWaitEC2 } from "@/app/api/checkout/aws-ec2";
import { secureFetch } from "@/app/utils/secure-fetch";

const BASE_URL = "https://driving-school-mocha.vercel.app";
const EC2_URL = "https://botopiapagosatldriving.xyz";

async function getRedirectUrlFromEC2(payload: any) {
  let attempt = 1;
  let lastError: string = "";
  for (let i = 0; i < 2; i++) {
    try {
      const ec2Response = await secureFetch(`${EC2_URL}/api/payments/redirect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (ec2Response.ok) {
        const responseData = await ec2Response.json();
        if (responseData.redirectUrl && typeof responseData.redirectUrl === "string") {
          return responseData.redirectUrl;
        } else {
          throw new Error("Invalid redirect URL received from EC2");
        }
      } else if (ec2Response.status === 401 && i === 0) {
        lastError = await ec2Response.text();
        attempt++;
        continue;
      } else {
        lastError = await ec2Response.text();
        throw new Error(`EC2 error: ${ec2Response.status} - ${lastError}`);
      }
    } catch (err: any) {
      lastError = err instanceof Error ? err.message : String(err);
      attempt++;
    }
  }
  throw new Error(`No se pudo obtener redirectUrl del EC2 tras 2 intentos. Último error: ${lastError}`);
}

// Espera a que el backend EC2 esté listo (responda en /health)
async function waitForBackendReady(url, maxTries = 20, delayMs = 3000, fetchTimeoutMs = 2000) {
  for (let i = 0; i < maxTries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);
    try {
      const res = await fetch(url, { method: "GET", signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return true;
      }
    } catch (e) {
      // Ignora el error, solo espera y reintenta
    } finally {
      clearTimeout(timeoutId);
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Espera a que EC2 esté encendida
    const ec2Result = await startAndWaitEC2(process.env.EC2_INSTANCE_ID!);
    const ok = ec2Result.success;
    if (!ok) {
      return NextResponse.json({ 
        error: "ec2", 
        message: "No se pudo encender la instancia EC2",
        details: ec2Result.error || "Unknown error"
      }, { status: 500 });
    }

    // 2. Espera a que el backend esté listo
    const backendReady = await waitForBackendReady(`${EC2_URL}/health`, 40, 3000);
    if (!backendReady) {
      return NextResponse.json({
        error: "ec2",
        message: "La instancia EC2 está encendida pero el backend no responde."
      }, { status: 500 });
    }

    // 3. Procesa los datos de la reserva
    await connectDB();
    const body = await req.json();
    const { userId, instructorId, date, start, end, classType, amount, pickupLocation, dropoffLocation } = body;

    if (!userId || !instructorId || !date || !start || !end || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Construir el payload para EC2
    const payload = {
      amount: Number(amount),
      firstName: user.firstName || "John",
      lastName: user.lastName || "Doe",
      email: user.email || "",
      phone: user.phoneNumber || "",
      userId,
      instructorId,
      date,
      start,
      end,
      classType: classType || "driving test",
      pickupLocation: pickupLocation || "",
      dropoffLocation: dropoffLocation || "",
      // Puedes agregar más campos si lo requiere la pasarela
      cancelUrl: `${BASE_URL}/payment-retry?userId=${userId}`,
      successUrl: `${BASE_URL}/payment-success?userId=${userId}`
    };

    // Obtener el redirectUrl de EC2
    const redirectUrl = await getRedirectUrlFromEC2(payload);
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    return NextResponse.json({ 
      error: "payment", 
      message: "There was an error processing the payment.", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 