import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(req: Request) {
  try {
    console.log("🟢 Conectando a la base de datos...");
    await connectDB();
    console.log("✅ Conectado a MongoDB");

    // Extraer el ID desde la URL
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop(); // Obtiene el último segmento de la URL

    console.log("🔎 Fetching instructor with ID:", id);

    // Verificar que el ID sea válido antes de hacer la consulta
    if (!id || id.length !== 24) {
      console.warn("⚠️ Invalid instructor ID format:", id);
      return NextResponse.json({ message: "Invalid instructor ID format" }, { status: 400 });
    }

    // Buscar instructor en la base de datos
    const instructor = await Instructor.findById(id).lean();

    if (!instructor) {
      console.warn("⚠️ Instructor not found:", id);
      return NextResponse.json({ message: "No instructor found" }, { status: 404 });
    }

    console.log("✅ Instructor found:", instructor);
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("❌ Error fetching instructor:", error);
    return NextResponse.json(
      { message: "Server error fetching instructor", error: (error as Error).message },
      { status: 500 }
    );
  }
}
