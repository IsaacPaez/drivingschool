import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeSchedule = searchParams.get('includeSchedule') === 'true';
    const canTeachDrivingTest = searchParams.get('canTeachDrivingTest') === 'true';

    let filter: Record<string, any> = {};
    let selectFields = 'name photo email specialization category type canTeachDrivingLesson canTeachDrivingTest canTeachTicketClass';

    // Incluir schedule_driving_lesson si se solicita
    if (includeSchedule) {
      selectFields += ' schedule_driving_lesson';
    }

    // Filtrar por tipo de instructor
    if (type === 'driving-lessons') {
      // Solo instructores con canTeachDrivingLesson: true
      filter = {
        canTeachDrivingLesson: true
      };
    }

    // Filtrar por canTeachDrivingTest
    if (canTeachDrivingTest) {
      filter.canTeachDrivingTest = true;
    }

    console.log('[API] Filter being used:', JSON.stringify(filter));
    console.log('[API] Select fields:', selectFields);

    const instructors = await Instructor.find(filter)
      .select(selectFields)
      .sort({ name: 1 })
      .lean();

    console.log('[API] Instructors found:', instructors.length);
    instructors.forEach(instructor => {
      console.log(`[API] ${instructor.name}: canTeachDrivingLesson = ${instructor.canTeachDrivingLesson}, canTeachDrivingTest = ${instructor.canTeachDrivingTest}`);
    });

    return NextResponse.json(instructors);

  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
