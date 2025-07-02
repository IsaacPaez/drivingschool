import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Instructor from "@/models/Instructor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instructorId: string }> }
) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const classType = searchParams.get('classType');
    const resolvedParams = await params;

    const instructor = await Instructor.findById(resolvedParams.instructorId);
    
    if (!instructor) {
      console.log('❌ Instructor not found:', resolvedParams.instructorId);
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    const schedule = instructor.get('schedule', { lean: true }) || [];
    console.log('🔎 Schedule original:', JSON.stringify(schedule, null, 2));
    console.log('🔎 classType recibido:', classType);
    
    // Debug: Let's see what class types are actually in the database
    const allClassTypes = new Set();
    if (schedule.length > 0 && Array.isArray(schedule[0]?.slots)) {
      schedule.forEach(day => {
        if (Array.isArray(day.slots)) {
          day.slots.forEach(slot => {
            if (slot.classType) allClassTypes.add(slot.classType);
          });
        }
      });
    } else {
      schedule.forEach(slot => {
        if (slot.classType) allClassTypes.add(slot.classType);
      });
    }
    console.log('🔍 Available class types in DB:', Array.from(allClassTypes));

    // Normalize function for better string comparison - keep dots for exact matching
    const normalize = (str: string) => {
      if (!str) return '';
      return str.replace(/\s+/g, '').toUpperCase().trim();
    };

    // Helper function to check if slot matches classType
    const isMatchingClassType = (slot: any, targetClassType: string) => {
      if (!slot.classType || !targetClassType) return false;
      
      const slotType = normalize(slot.classType);
      const targetType = normalize(targetClassType);
      
      // Direct match
      if (slotType === targetType) return true;
      
      // Handle special mappings for exact string matches
      if (targetType === 'A.D.I' && slotType === 'A.D.I') return true;
      if (targetType === 'B.D.I' && slotType === 'B.D.I') return true;
      if (targetType === 'D.A.T.E' && slotType === 'D.A.T.E') return true;
      if (targetType === 'DRIVING TEST' && slotType === 'DRIVING TEST') return true;
      
      return false;
    };

    if (!classType) {
      // Agrupar todos los slots por fecha (soporta ambos formatos)
      let allSlots: any[] = [];
      if (schedule.length > 0 && Array.isArray(schedule[0]?.slots)) {
        // Formato 2: [{ date, slots: [...] }]
        schedule.forEach(day => {
          if (Array.isArray(day.slots)) {
            day.slots.forEach(slot => allSlots.push({ ...slot, date: day.date }));
          }
        });
      } else {
        // Formato 1: [{ date, start, ... }]
        allSlots = schedule;
      }
      const grouped: Record<string, any[]> = {};
      for (const slot of allSlots) {
        if (!grouped[slot.date]) grouped[slot.date] = [];
        grouped[slot.date].push(slot);
      }
      const result = Object.entries(grouped).map(([date, slots]) => ({ date, slots }));
      console.log('🟢 Devolviendo schedule agrupado por fecha:', JSON.stringify(result, null, 2));
      return NextResponse.json(result);
    }

    // Si hay classType, filtrar por tipo (soporta ambos formatos)
    const filteredSchedule: any[] = [];
    console.log('🔍 Filtering for classType:', classType);
    
    if (schedule.length > 0 && Array.isArray(schedule[0]?.slots)) {
      // Formato 2
      for (const day of schedule) {
        if (Array.isArray(day.slots)) {
          const matchingSlots = day.slots.filter((slot) => {
            const matches = isMatchingClassType(slot, classType);
            if (matches) {
              console.log('✅ Slot matches:', { date: day.date, slot: slot.classType, start: slot.start, end: slot.end });
            }
            return matches;
          });
          if (matchingSlots.length > 0) {
            filteredSchedule.push({
              date: day.date,
              slots: matchingSlots
            });
          }
        }
      }
    } else {
      // Formato 1
      const matchingSlots = schedule.filter((slot) => {
        const matches = isMatchingClassType(slot, classType);
        if (matches) {
          console.log('✅ Slot matches:', { date: slot.date, slot: slot.classType, start: slot.start, end: slot.end });
        }
        return matches;
      });
      const grouped: Record<string, any[]> = {};
      for (const slot of matchingSlots) {
        if (!grouped[slot.date]) grouped[slot.date] = [];
        grouped[slot.date].push(slot);
      }
      for (const [date, slots] of Object.entries(grouped)) {
        filteredSchedule.push({ date, slots });
      }
    }
    console.log('🟢 filteredSchedule:', JSON.stringify(filteredSchedule, null, 2));
    return NextResponse.json(filteredSchedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
