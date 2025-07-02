import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET() {
  await connectDB();
  const instructors = await Instructor.find().lean();
  return NextResponse.json(instructors);
} 