import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PageContent from "@/models/PageContent";

/**
 * API para obtener contenido de páginas
 * GET /api/page-content?pageType=home
 */
export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const pageType = searchParams.get("pageType");

    if (!pageType) {
      return NextResponse.json(
        { message: "pageType query parameter is required" },
        { status: 400 }
      );
    }

    // Solo devolver contenido activo, ordenado por order descendente
    const pageContent = await PageContent.findOne({ 
      pageType, 
      isActive: true 
    }).sort({ order: -1 });

    if (!pageContent) {
      return NextResponse.json(
        { message: `No active content found for page type: ${pageType}` },
        { status: 404 }
      );
    }

    return NextResponse.json(pageContent, { status: 200 });
  } catch (error) {
    console.error("[GET_PAGE_CONTENT_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}
