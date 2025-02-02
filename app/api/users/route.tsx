import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("📡 Conectando a MongoDB...");
    await connectDB();
    console.log("✅ Conexión exitosa.");

    // Obtener el ID del usuario autenticado
    const { userId } = await auth();

    if (!userId) {
      console.log("❌ Usuario no autenticado.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🔑 Usuario autenticado: ${userId}`);

    // Obtener datos del usuario desde Clerk
    console.log("📡 Consultando usuario en Clerk...");
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.log("❌ Error al obtener usuario de Clerk.");
      return NextResponse.json(
        { error: "Error fetching user from Clerk" },
        { status: 500 }
      );
    }

    const clerkUser = await response.json();
    console.log("✅ Datos obtenidos de Clerk:", clerkUser);

    if (!clerkUser.email_addresses || clerkUser.email_addresses.length === 0) {
      console.log("❌ Usuario sin email registrado en Clerk.");
      return NextResponse.json(
        { error: "No email found for user" },
        { status: 400 }
      );
    }

    const email = clerkUser.email_addresses[0].email_address;
    const name = `${clerkUser.first_name || ""} ${
      clerkUser.last_name || ""
    }`.trim();

    // Verificar si el usuario ya está en la base de datos
    console.log(`🔍 Buscando usuario en MongoDB con clerkId: ${userId}...`);
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log("🆕 Usuario no encontrado. Creando nuevo usuario...");
      user = await User.create({
        clerkId: userId,
        email: email,
        name: name,
      });
      console.log("✅ Usuario creado en MongoDB:", user);
    } else {
      console.log("✅ Usuario ya existente en MongoDB:", user);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
