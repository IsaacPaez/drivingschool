import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Locations from "@/models/Locations"; // Asegúrate de que el modelo se llama Location

export async function GET(req: Request) {
  try {
    await connectDB();

    // Obtiene todas las ubicaciones con los campos necesarios
    const locations = await Locations.find({}, "title phone email address zone locationImage");

    if (!locations || locations.length === 0) {
      return NextResponse.json({ message: "No hay ubicaciones registradas." }, { status: 404 });
    }

    return NextResponse.json(locations);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error en el servidor al obtener ubicaciones", error: errorMessage },
      { status: 500 }
    );
  }
}
