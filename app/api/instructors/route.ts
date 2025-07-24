import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeSchedule = searchParams.get('includeSchedule') === 'true';
    
    // console.log('🔍 Fetching instructors with type:', type, 'includeSchedule:', includeSchedule);
    
    let filter = {};
    let selectFields = 'name photo email specialization category type';
    
    // Incluir schedule_driving_lesson si se solicita
    if (includeSchedule) {
      selectFields += ' schedule_driving_lesson';
    }
    
    // Filtrar por tipo de instructor
    if (type === 'driving-lessons') {
      // Buscar instructores que tengan driving lessons o todos si no hay específicos
      filter = {
        $or: [
          { canTeachDrivingLesson: true },
          { category: 'driving-lessons' },
          { type: 'driving-lessons' },
          { specialization: { $in: ['driving', 'driving-lessons', 'road-skills'] } },
          { schedule_driving_lesson: { $exists: true } }
        ]
      };
    }
    
    const instructors = await Instructor.find(filter)
      .select(selectFields)
      .sort({ name: 1 })
      .lean();
    
    // console.log('👨‍🏫 Instructors found:', instructors.length);
    // console.log('📋 Instructors data:', JSON.stringify(instructors, null, 2));
    
    // Si no encontramos instructores específicos, devolver todos
    if (instructors.length === 0 && type === 'driving-lessons') {
      // console.log('📝 No specific driving instructors found, fetching all instructors');
      const allInstructors = await Instructor.find({})
        .select(selectFields)
        .sort({ name: 1 })
        .lean();
      
      return NextResponse.json(allInstructors);
    }
    
    return NextResponse.json(instructors);
    
  } catch (error) {
    console.error('❌ Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 