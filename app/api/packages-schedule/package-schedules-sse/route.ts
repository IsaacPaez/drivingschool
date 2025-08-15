import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TicketClass from '@/models/TicketClass';
import Classes from '@/models/Classes';

interface ScheduleData {
  _id: string;
  date: string;
  hour: string;
  endHour: string;
  availableSpots: number;
  totalSpots: number;
  status: string;
  instructorInfo?: {
    _id: string;
    name: string;
    email: string;
  };
  classInfo?: {
    name: string;
    classType: string;
  };
}

interface SSEResponse {
  schedules?: ScheduleData[];
  error?: string;
  timestamp: string;
  count?: number;
  type?: string;
}

export async function GET(req: NextRequest) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  };

  const stream = new ReadableStream({
    async start(controller) {
      console.log('🚀 Starting package schedules SSE stream...');

      const encoder = new TextEncoder();
      let isActive = true;

      // Function to send data to client
      const sendData = (data: SSEResponse) => {
        if (!isActive) return;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('❌ Error sending SSE data:', error);
        }
      };

      // Function to fetch package schedules (driving lesson schedules)
      const fetchPackageSchedules = async () => {
        try {
          await connectDB();
          console.log('📦 Fetching package schedules...');

          // Buscar clases de driving lessons
          const drivingLessonClasses = await Classes.find({
            $or: [
              { classType: { $regex: /driving/i } },
              { classType: { $regex: /road/i } },
              { classType: 'B.D.I' }, // Behind-the-wheel driving instruction
              { name: { $regex: /driving|road/i } }
            ]
          }).lean();

          console.log('🚗 Found driving lesson classes:', drivingLessonClasses.length);

          if (drivingLessonClasses.length === 0) {
            // Si no hay clases específicas, usar todas las clases disponibles
            const allClasses = await Classes.find({}).lean();
            console.log('📚 Using all classes as fallback:', allClasses.length);
            drivingLessonClasses.push(...allClasses);
          }

          const classIds = drivingLessonClasses.map(cls => cls._id);

          // Obtener horarios disponibles para estas clases
          const schedules = await TicketClass.aggregate([
            {
              $match: {
                classId: { $in: classIds },
                date: { $gte: new Date().toISOString().split('T')[0] }, // Solo fechas futuras
                status: { $in: ['available', 'open'] }
              }
            },
            {
              $lookup: {
                from: 'instructors',
                localField: 'instructorId',
                foreignField: '_id',
                as: 'instructorInfo'
              }
            },
            {
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'classInfo'
              }
            },
            {
              $addFields: {
                instructorInfo: { $arrayElemAt: ['$instructorInfo', 0] },
                classInfo: { $arrayElemAt: ['$classInfo', 0] }
              }
            },
            {
              $project: {
                _id: 1,
                date: 1,
                hour: 1,
                endHour: 1,
                availableSpots: 1,
                totalSpots: 1,
                status: 1,
                'instructorInfo._id': 1,
                'instructorInfo.name': 1,
                'instructorInfo.email': 1,
                'classInfo.name': 1,
                'classInfo.classType': 1
              }
            },
            {
              $sort: { date: 1, hour: 1 }
            }
          ]);

          // console.log('📅 Package schedules found:', schedules.length);

          return {
            schedules,
            timestamp: new Date().toISOString(),
            count: schedules.length
          };

        } catch (error) {
          console.error('❌ Error fetching package schedules:', error);
          return {
            schedules: [],
            error: 'Failed to fetch schedules',
            timestamp: new Date().toISOString()
          };
        }
      };

      // Send initial data
      try {
        const initialData = await fetchPackageSchedules();
        sendData(initialData);
      } catch (error) {
        console.error('❌ Error sending initial package schedules data:', error);
        sendData({ 
          error: 'Failed to load initial data', 
          schedules: [],
          timestamp: new Date().toISOString()
        });
      }

      // Polling eliminado - solo usamos change streams de MongoDB para actualizaciones en tiempo real
      // Los change streams notifican automáticamente cuando hay cambios reales

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        console.log('🔌 Package schedules SSE client disconnected');
        isActive = false;
        try {
          controller.close();
        } catch (error) {
          console.error('❌ Error closing package schedules SSE controller:', error);
        }
      });
    },
  });

  return new Response(stream, { headers });
}
