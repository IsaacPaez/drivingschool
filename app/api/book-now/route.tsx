import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("id");

    console.log("📌 API Request: GET Instructor");
    console.log("🔎 Received instructor ID:", instructorId);

    try {
        if (!instructorId) {
            const instructors = await Instructor.find();
            console.log("✅ Returning all instructors:", instructors);
            return NextResponse.json(instructors, { status: 200 });
        }

        const instructor = await Instructor.findById(instructorId).lean();
        if (!instructor) {
            console.error("❌ Instructor not found:", instructorId);
            return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
        }

        if (Array.isArray(instructor)) {
            console.error("❌ Instructor is an array:", instructor);
            return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
        }
        console.log(`✅ Schedule for ${instructor.name}:`, instructor.schedule);
        return NextResponse.json({ schedule: instructor.schedule }, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching instructor:", error);
        return NextResponse.json({ error: "Error fetching instructor" }, { status: 500 });
    }
}
