import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); 

    let products;

    if (category) {
      products = await Product.find({ category }).select("title description price buttonLabel media");
    } else {
      products = await Product.find().select("title description price buttonLabel media");
    }

    console.log(`✅ Productos obtenidos (Categoría: ${category || "Todas"}):`, products);
    return NextResponse.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
  }
}
