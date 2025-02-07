  import { NextResponse } from "next/server";
  import { connectDB } from "@/lib/mongodb";
  import Instructor from "@/models/Instructor";

  // 📌 OBTENER TODOS LOS INSTRUCTORES (GET)
  export async function GET() {
    await connectDB();
    try {
      const instructors = await Instructor.find();
      return NextResponse.json(instructors, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Error fetching instructors" }, { status: 500 });
    }
  }
  // 📌 CREAR UN NUEVO INSTRUCTOR (POST)
  export async function POST(req: Request) {
    await connectDB();
    try {
      const { name, photo, certifications, experience, schedule } = await req.json();
      const newInstructor = new Instructor({ name, photo, certifications, experience, schedule });
      await newInstructor.save();
      return NextResponse.json(newInstructor, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Error creating instructor" }, { status: 400 });
    }
  }