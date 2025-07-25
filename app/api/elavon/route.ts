import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from '@/models/Order';
import Cart from '@/models/Cart';

const EC2_URL = "https://botopiapagosatldriving.xyz";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { amount, items, userId } = await req.json();

    console.log("🔸 Incoming request body:", { amount, items, userId });

    // Validar el total de los items
    const backendTotal = items && Array.isArray(items)
      ? items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)
      : amount;

    console.log("🔹 Calculated backend total:", backendTotal);
    if (items && parseFloat(backendTotal) !== parseFloat(amount)) {
      console.warn("⚠️ Cart total mismatch:", { received: amount, calculated: backendTotal });
      return NextResponse.json({ error: "Cart total mismatch." }, { status: 400 });
    }

    if (!userId) {
      console.warn("⚠️ Missing userId");
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      console.warn("⚠️ User not found in DB for ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userDoc.toObject();
    //console.log("✅ Loaded user data:", {
    //  firstName: user.firstName,
    //  lastName: user.lastName,
    //  email: user.email,
    //  phone: user.phoneNumber
    //});

    // Extraer todos los campos necesarios para el pago
    const payload = {
      amount: parseFloat(backendTotal) || 78965,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      dni: user.dni || "",
      items: items || []
    };

    console.log("📦 Payload sent to EC2:", payload);

    // Enviar al backend EC2 para que genere el token
    const ec2Res = await fetch(`${EC2_URL}/api/payments/session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("📨 EC2 response status:", ec2Res.status);

    if (!ec2Res.ok) {
      const err = await ec2Res.text();
      console.error("❌ EC2 session-token error:", err);
      return NextResponse.json({ error: "Failed to generate token from EC2" }, { status: 500 });
    }

    const { token } = await ec2Res.json();
    console.log("✅ Received token from EC2:", token);

    if (!token) {
      console.error("❌ No token received from EC2 response");
      return NextResponse.json({ error: "No token received from EC2" }, { status: 500 });
    }

    // Guardar la orden en la base de datos antes de redirigir a Elavon
    const createdOrder = await Order.create({
      userId,
      items,
      total: parseFloat(backendTotal),
      estado: 'pendiente',
      createdAt: new Date(),
    });
    console.log('📝 Orden creada:', createdOrder);

    // Vaciar el carrito del usuario en la base de datos
    const cartDeleteResult = await Cart.deleteOne({ userId });
    console.log('🗑️ Resultado de borrar carrito:', cartDeleteResult);

    return NextResponse.json({ token });

  } catch (error) {
    console.error("💥 Token creation failed:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
