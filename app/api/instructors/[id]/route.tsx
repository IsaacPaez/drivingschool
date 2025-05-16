import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(req: Request) {
  try {
    await connectDB();
    // Extraer el ID desde la URL
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop(); // Obtiene el último segmento de la URL

    // Verificar que el ID sea válido antes de hacer la consulta
    if (!id || id.length !== 24) {
      return NextResponse.json({ message: "Invalid instructor ID format" }, { status: 400 });
    }

    // Buscar instructor en la base de datos
    const instructor = await Instructor.findById(id).lean();

    if (!instructor) {
      return NextResponse.json({ message: "No instructor found" }, { status: 404 });
    }

    return NextResponse.json(instructor);
  } catch (error) {
    return NextResponse.json(
      { message: "Server error fetching instructor", error: (error as Error).message },
      { status: 500 }
    );
  }
}
