import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log("🔎 Fetching instructor with ID:", params.id);
    await connectDB();

    // Verifica que el ID sea válido antes de hacer la consulta
    if (!params.id || params.id.length !== 24) {
      console.warn("⚠️ Invalid instructor ID format:", params.id);
      return NextResponse.json({ message: "Invalid instructor ID format" }, { status: 400 });
    }

    // Buscar instructor en la base de datos
    const instructor = await Instructor.findById(params.id).lean();

    if (!instructor) {
      console.warn("⚠️ Instructor not found:", params.id);
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
