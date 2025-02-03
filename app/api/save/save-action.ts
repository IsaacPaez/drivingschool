import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userId, email, transactionStatus, ...data } = body;

    await connectDB();
    const db = mongoose.connection.useDb("DrivingSchool_Admin");
    const collection = db.collection("actions");

    // 🔹 Ahora también almacenamos el userId, email y estado de la transacción
    await collection.insertOne({
      type,
      userId,
      email,
      transactionStatus,
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error en save-action:", error);
    return NextResponse.json(
      { error: "Error al guardar la acción" },
      { status: 500 }
    );
  }
}
