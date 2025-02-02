import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classes from "@/models/Classes";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Obtiene todos los campos del modelo, incluyendo los arrays
    const classes = await Classes.find({}, "title alsoKnownAs length price overview objectives contact image buttonLabel");

    if (!classes || classes.length === 0) {
      return NextResponse.json({ message: "No hay clases registradas." }, { status: 404 });
    }

    return NextResponse.json(classes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error en el servidor al obtener clases", error: errorMessage },
      { status: 500 }
    );
  }
}
