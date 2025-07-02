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
    
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 });
    }
    
    // First, get the instructor with their schedule
    const instructor = await Instructor.findById(instructorId).lean() as any;
    if (!instructor || !instructor.schedule) {
      return NextResponse.json([]);
    }
    
    // Find all unique ticketClassIds from the instructor's schedule that match the class type
    const ticketClassIds = new Set<string>();
    
    instructor.schedule.forEach((daySchedule: any) => {
      daySchedule.slots?.forEach((slot: any) => {
        if (slot.ticketClassId && (!classType || slot.classType === classType)) {
          ticketClassIds.add(slot.ticketClassId);
        }
      });
    });
    
    if (ticketClassIds.size === 0) {
      return NextResponse.json([]);
    }
    
    // Get all the ticket classes
    const ticketClasses = await TicketClass.find({
      _id: { $in: Array.from(ticketClassIds) }
    }).lean();
    
    // Populate class info for each ticket class
    const ticketClassesWithInfo = await Promise.all(
      ticketClasses.map(async (tc: any) => {
        const classInfo = await Classes.findOne({ type: tc.type }).lean();
        return {
          ...tc,
          classInfo: classInfo || null,
          instructorInfo: {
            _id: instructor._id,
            name: instructor.name,
            email: instructor.email,
            photo: instructor.photo
          }
        };
      })
    );
    
    return NextResponse.json(ticketClassesWithInfo);
  } catch (error) {
    console.error('Error fetching ticket classes:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket classes' }, { status: 500 });
  }
}