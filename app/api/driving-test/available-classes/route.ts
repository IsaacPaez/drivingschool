import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Location from "@/models/Locations";
import Instructor, { ScheduleSlot } from "@/models/Instructor";

export async function GET(request: NextRequest) {
  try {
    // console.log('🟢 Endpoint /api/driving-test/available-classes called');
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0');
    
    // console.log('🔍 Getting available driving test classes for locationId:', locationId);
    
    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // 1. Buscar la ubicación y obtener los instructores
    const location = await Location.findById(locationId).populate('instructors');
    
    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // console.log('📍 Location found:', location.zone);
    // console.log('👥 Instructors in location:', location.instructors.length);

    // 2. Filtrar instructores que pueden enseñar driving test
    const drivingTestInstructors = await Instructor.find({
      _id: { $in: location.instructors },
      canTeachDrivingTest: true
    });

    // console.log('🚗 Driving test instructors found:', drivingTestInstructors.length);

    // 3. Obtener todas las clases disponibles de estos instructores
    const availableClasses: {
      instructorId: string;
      instructorName: string;
      instructorPhoto: string;
      date: string;
      start: string;
      end: string;
      status: string;
      classType: string;
      slotId: string;
      amount?: number;
    }[] = [];
    
    // Calcular las fechas de la semana basándose en weekOffset
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]); // formato YYYY-MM-DD
    }

    // console.log('📅 Week dates:', weekDates);

    for (const instructor of drivingTestInstructors) {
      // console.log(`👨‍🏫 Checking instructor: ${instructor.name}`);
      // console.log(`   - Has schedule_driving_test: ${!!instructor.schedule_driving_test}`);
      // console.log(`   - Schedule length: ${instructor.schedule_driving_test?.length || 0}`);
      
      if (instructor.schedule_driving_test && instructor.schedule_driving_test.length > 0) {
        // Mostrar algunos ejemplos de slots para debug
        // console.log(`   - Sample slots:`, instructor.schedule_driving_test.slice(0, 3).map(slot => ({
        //   date: slot.date,
        //   start: slot.start,
        //   status: slot.status,
        //   booked: slot.booked
        // })));
        
        // Filtrar clases disponibles para esta semana
        const weekClasses = instructor.schedule_driving_test.filter((slot: ScheduleSlot) => {
          const matchesDate = weekDates.includes(slot.date);
          // Aceptar tanto 'available' como 'free' como estados válidos
          const matchesStatus = slot.status === 'available' || slot.status === 'free';
          const notBooked = !slot.booked;
          
          // console.log(`   - Slot ${slot.date} ${slot.start}: date=${matchesDate}, status=${matchesStatus} (${slot.status}), notBooked=${notBooked}`);
          
          return matchesDate && matchesStatus && notBooked;
        });

        // console.log(`👨‍🏫 ${instructor.name} has ${weekClasses.length} available slots this week`);

        weekClasses.forEach(slot => {
          availableClasses.push({
            instructorId: instructor._id,
            instructorName: instructor.name,
            instructorPhoto: instructor.photo,
            date: slot.date,
            start: slot.start,
            end: slot.end,
            status: slot.status,
            classType: 'driving_test',
            slotId: slot._id,
            amount: slot.amount || 50 // Incluir el amount, default 50 si no existe
          });
        });
      }
    }

    // console.log('✅ Total available classes found:', availableClasses.length);

    return NextResponse.json({
      success: true,
      location: {
        id: location._id,
        zone: location.zone,
        title: location.title
      },
      instructors: drivingTestInstructors.map(inst => ({
        _id: inst._id,
        name: inst.name,
        photo: inst.photo,
        canTeachDrivingTest: inst.canTeachDrivingTest
      })),
      availableClasses,
      weekDates,
      totalSlots: availableClasses.length
    });

  } catch (error) {
    console.error("❌ Error getting available driving test classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch available classes" },
      { status: 500 }
    );
  }
}
