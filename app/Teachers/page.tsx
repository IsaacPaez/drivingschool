'use client';
import { useEffect, useState } from 'react';
import InstructorCalendar from '../../components/TeachersCalendar/InstructorCalendar';

export default function TeachersPage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // ID del instructor Adrian
    const instructorId = '67a620fea350b6926209c5ec';
    fetch(`/api/teachers?instructorId=${instructorId}`)
      .then(res => res.json())
      .then(data => {
        // Adaptar el formato para el calendario
        const adapted = (data || []).map((item: any) => ({
          date: new Date(item.date),
          hour: item.hour,
          status: 'scheduled',
          classId: item._id
        }));
        setClasses(adapted);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white w-full flex flex-col items-center justify-start pt-40 px-2 md:px-12">
      <h1 className="text-3xl font-bold text-black mb-10 w-full max-w-8xl text-left">Adrian's Calendar</h1>
      <div className="w-full max-w-8xl text-black">
        <InstructorCalendar schedule={classes} />
      </div>
    </div>
  );
}
