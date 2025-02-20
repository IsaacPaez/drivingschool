import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Locations from "@/models/Locations";
import Instructor from "@/models/Instructor";

export async function GET(req: Request) {
  try {
    console.log("🟢 Conectando a la base de datos...");
    await connectDB();
    console.log("✅ Conectado a MongoDB");

    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");

    let query = {};
    if (zone) {
      query = { zone: decodeURIComponent(zone) };
    }

    console.log("📌 Fetching locations with query:", query);

    // 🔹 Asegurar que se poblen bien los instructores y se convierta en JSON limpio
    const locations = await Locations.find(query)
      .populate({
        path: "instructors",
        model: Instructor,
        select: "_id name photo certifications experience" // 👈 Solo seleccionamos lo necesario
      })
      .lean(); // 👈 Convierte a JSON para evitar problemas de referencias

    console.log("📌 Locations with populated instructors:", JSON.stringify(locations, null, 2));

    if (!locations || locations.length === 0) {
      console.warn("⚠️ No locations found.");
      return NextResponse.json({ message: "No locations found." }, { status: 404 });
    }

    console.log("✅ Locations fetched successfully.");
    return NextResponse.json(locations);
  } catch (error) {
    console.error("❌ Error fetching locations:", error);
    return NextResponse.json(
      { message: "Server error fetching locations", error: (error as Error).message },
      { status: 500 }
    );
  }
}
