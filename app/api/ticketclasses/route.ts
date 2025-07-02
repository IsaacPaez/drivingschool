import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import Instructor from '@/models/Instructor';
import Classes from '@/models/Classes';
import Locations from '@/models/Locations';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const classType = searchParams.get('type');
    
    //console.log(`🎫 API: Fetching ticketclasses for instructor: ${instructorId}, type: ${classType}`);
    
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 });
    }
    
    // Build query to find ticket classes directly by instructorId
    let query: any = {
      instructorId: instructorId
    };
    
    // Filter by class type if specified
    if (classType && classType !== 'ALL') {
      // Map frontend values to database values
      const typeMapping: { [key: string]: string } = {
        'A.D.I': 'adi',
        'B.D.I': 'bdi', 
        'D.A.T.E': 'date'
      };
      
      const dbType = typeMapping[classType] || classType.toLowerCase();
      query.type = dbType;
    }
    
    console.log(`🔍 API: Query for ticketclasses:`, query);
    
    // Helper function to calculate endhour if missing
    const calculateEndHour = (startHour: string, duration: string): string => {
      try {
        if (!startHour || !duration) return startHour;
        
        // Parse start hour (e.g., "12:30" -> 12.5 hours)
        const [hours, minutes] = startHour.split(':').map(Number);
        const startInMinutes = hours * 60 + (minutes || 0);
        
        // Parse duration (e.g., "1h 30m" or "90" minutes)
        let durationInMinutes = 0;
        if (duration.includes('h')) {
          const hourMatch = duration.match(/(\d+)h/);
          const minuteMatch = duration.match(/(\d+)m/);
          durationInMinutes = (hourMatch ? parseInt(hourMatch[1]) * 60 : 0) + (minuteMatch ? parseInt(minuteMatch[1]) : 0);
        } else {
          // Assume it's in minutes
          durationInMinutes = parseInt(duration) || 60; // Default 1 hour
        }
        
        // Calculate end time
        const endInMinutes = startInMinutes + durationInMinutes;
        const endHours = Math.floor(endInMinutes / 60);
        const endMins = endInMinutes % 60;
        
        return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      } catch (error) {
        console.error('Error calculating end hour:', error);
        return startHour;
      }
    };

    // DEBUG: Let's see what ticket classes exist for this instructor (regardless of type)
    const allTicketClasses = await TicketClass.find({ instructorId: instructorId }).lean();
    console.log(`🔍 DEBUG: All ticket classes for instructor ${instructorId}:`, allTicketClasses.length);
    allTicketClasses.forEach(tc => {
      console.log(`🔍 DEBUG RAW OBJECT:`, tc);
      console.log(`🔍 DEBUG FIELDS:`, {
        type: tc.type,
        date: tc.date,
        hour: tc.hour,
        endHour: tc.endHour,
        duration: tc.duration,
        allKeys: Object.keys(tc)
      });
      console.log(`  - Class: ${tc.type}, Date: ${tc.date}, Hour: ${tc.hour}, EndHour: ${tc.endHour}, Duration: ${tc.duration}`);
    });
    
    // Get all the ticket classes for this instructor
    const ticketClasses = await TicketClass.find(query).lean();
    
    console.log(`📊 API: Found ${ticketClasses.length} ticketclasses`);
    
    if (ticketClasses.length === 0) {
      return NextResponse.json([]);
    }
    
    // Populate class info for each ticket class
    const ticketClassesWithInfo = await Promise.all(
      ticketClasses.map(async (tc: any) => {
        // Get instructor info to access their schedule
        const instructor = await Instructor.findById(tc.instructorId).lean() as any;
        
        // Get class info using classId
        const classInfo = await Classes.findById(tc.classId).lean() as any;
        
        // Find the status by looking for this ticketClassId in instructor's schedule
        let status = 'available';
        let availableSpots = tc.cupos || 0;
        
        if (instructor?.schedule) {
          // Search through instructor's schedule to find this ticket class
          for (const daySchedule of instructor.schedule) {
            if (daySchedule.slots) {
              const slot = daySchedule.slots.find((slot: any) => 
                slot.ticketClassId && slot.ticketClassId.toString() === tc._id.toString()
              );
              if (slot) {
                status = slot.status || 'available';
                break;
              }
            }
          }
        }
        
        // Calculate enrolled students and available spots
        const enrolledStudents = tc.students ? tc.students.length : 0;
        const totalSpots = tc.cupos || 0;
        availableSpots = totalSpots - enrolledStudents;
        
        // DEBUG: Check the endHour field specifically
        console.log(`🔍 DEBUG TICKET CLASS FIELDS:`, {
          _id: tc._id,
          type: tc.type,
          hour: tc.hour,
          endHour: tc.endHour,
          duration: tc.duration,
          hasEndHour: tc.hasOwnProperty('endHour'),
          endHourType: typeof tc.endHour,
          allKeys: Object.keys(tc)
        });
        
        return {
          ...tc,
          status,
          availableSpots,
          enrolledStudents, // Add this to show enrolled count
          totalSpots: tc.cupos || 0, // Add this to show total spots
          // Use the real endHour from database, not calculated
          endHour: tc.endHour,
          // Add class info
          classInfo: classInfo ? {
            _id: classInfo._id,
            title: classInfo.title,
            overview: classInfo.overview
          } : null,
          instructorInfo: instructor ? {
            _id: instructor._id,
            name: instructor.name,
            email: instructor.email,
            photo: instructor.photo
          } : null
        };
      })
    );
    
    console.log(`✅ API: Returning ${ticketClassesWithInfo.length} classes with info`);
    return NextResponse.json(ticketClassesWithInfo);
  } catch (error) {
    console.error('❌ API: Error fetching ticket classes:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket classes' }, { status: 500 });
  }
}