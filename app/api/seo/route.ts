import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SEO } from "@/models/SEO"; // Usa el modelo SEO

export async function GET() {
  try {
    await connectDB();

    const seoSettings = await SEO.findOne();
    if (!seoSettings) {
      return NextResponse.json({ message: "No SEO settings found" }, { status: 404 });
    }

    return NextResponse.json(seoSettings);
  } catch (error) {
    console.error("❌ Error obteniendo datos de SEO:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
