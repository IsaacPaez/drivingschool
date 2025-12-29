import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET() {
  try {
    await connectDB();

    const resources = await Resource.find(
      { isActive: true },
      "title image href order"
    ).sort({ order: 1, createdAt: -1 });

    return NextResponse.json(resources);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Server error fetching resources", error: errorMessage },
      { status: 500 }
    );
  }
}
