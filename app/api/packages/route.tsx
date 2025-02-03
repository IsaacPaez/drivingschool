import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Packages from "@/models/Packages";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Obtener todos los paquetes con los campos necesarios
    const packages = await Packages.find({}, "title description media price category type buttonLabel");

    if (!packages || packages.length === 0) {
      return NextResponse.json({ message: "No packages found." }, { status: 404 });
    }

    return NextResponse.json(packages);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Server error fetching packages", error: errorMessage },
      { status: 500 }
    );
  }
}
