import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const newContact = await Contact.create(data);

    return NextResponse.json(
      { message: "Contacto guardado exitosamente.", contact: newContact },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error guardando el contacto:", error);
    return NextResponse.json(
      { error: "Hubo un problema guardando el contacto." },
      { status: 500 }
    );
  }
}
