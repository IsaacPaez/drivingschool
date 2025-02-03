import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Locations from "@/models/Locations";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");

    let query = {};
    if (zone) {
      query = { zone: decodeURIComponent(zone) };
    }

    // ✅ Aseguramos que se obtienen todos los datos correctamente
    const locations = await Locations.find(query).lean();

    if (!locations || locations.length === 0) {
      return NextResponse.json({ message: "No locations found." }, { status: 404 });
    }

    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json(
      { message: "Server error fetching locations", error: (error as Error).message },
      { status: 500 }
    );
  }
}
