import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("id");

    try {
        if (!instructorId) {
            const instructors = await Instructor.find();
            return NextResponse.json(instructors, { status: 200 });
        }

        if (!mongoose.Types.ObjectId.isValid(instructorId)) {
            return NextResponse.json({ error: "Invalid instructor ID" }, { status: 400 });
        }

        const instructor = await Instructor.findById(instructorId).lean();
        if (!instructor) {
            return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
        }

        if (Array.isArray(instructor)) {
            return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
        }
        return NextResponse.json({ schedule: instructor.schedule }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Error fetching instructor" }, { status: 500 });
    }
}
