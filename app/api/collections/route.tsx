import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // ✅ Se mantiene sin afectar `products`
import Collection from "@/models/Collection"; // ✅ Modelo de Collection

// GET: Obtener todas las colecciones de la base de datos
export async function GET() {
  try {
    await connectToDatabase();
    const collections = await Collection.find({});
    return NextResponse.json(collections);
  } catch (error) {
    console.error("❌ Error en la base de datos:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
