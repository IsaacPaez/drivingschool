'use client';
import { useEffect, useState } from 'react';
import InstructorCalendar from '../../components/TeachersCalendar/InstructorCalendar';
import MiniCalendar from '../../components/TeachersCalendar/MiniCalendar';

export default function TeachersPage() {
  const [schedule, setSchedule] = useState([]);
  const [instructorName, setInstructorName] = useState('');
  const [instructorPhoto, setInstructorPhoto] = useState('');
  const [certifications, setCertifications] = useState('');
  const [experience, setExperience] = useState('');
  const [rawSchedule, setRawSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // ID del instructor Isaac
    const instructorId = '67a69c8776a7962fe143e58d';
    fetch(`/api/teachers?id=${instructorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setInstructorName('Instructor');
          setInstructorPhoto('');
          setCertifications('');
          setExperience('');
          setSchedule([]);
          setRawSchedule([]);
          return;
        }
        setInstructorName(data.name || 'Instructor');
        setInstructorPhoto(data.photo || '');
        setCertifications(data.certifications || '');
        setExperience(data.experience || '');
        setRawSchedule(data.schedule || []);
        console.log('Schedule que se pasa a InstructorCalendar:', data.schedule);
        // Adaptar el schedule: cada slot se expande a cada hora ocupada (incluyendo el último bloque)
        const adapted = (data.schedule || []).flatMap((item: any) =>
          (item.slots || []).flatMap((slot: any) => {
            const startHour = parseInt(slot.start.split(':')[0], 10);
            const endHour = parseInt(slot.end.split(':')[0], 10);
            // Normalizar la fecha para que solo tenga año, mes y día
            const baseDate = new Date(item.date);
            const normalizedDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
            return Array.from({ length: endHour - startHour }, (_, i) => ({
              date: normalizedDate,
              hour: startHour + i,
              status: 'scheduled',
              slotId: slot._id
            }));
          })
        );
        setSchedule(adapted);
      });
  }, []);

  const fetchSchedule = async () => {
    const instructorId = '67a69c8776a7962fe143e58d';
    const res = await fetch(`/api/teachers?id=${instructorId}`);
    const data = await res.json();
    setRawSchedule(data.schedule || []);
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col items-center justify-start pt-40 px-2 md:px-12 relative">
      {/* Foto y nombre del instructor en la esquina superior izquierda */}
      {instructorPhoto && (
        <div className="absolute top-6 left-6 flex flex-col items-center z-20">
          <img src={instructorPhoto} alt={instructorName} className="w-16 h-16 rounded-full shadow-lg object-cover border-4 border-green-400 mb-2" />
          <div className="text-left">
            <span className="block text-xl font-extrabold text-blue-700 leading-tight">{instructorName}</span>
            <span className="block text-lg font-bold text-black leading-tight">Calendar</span>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center mb-10">
        {(certifications || experience) && (
          <div className="mt-2 text-lg text-gray-700 text-center">
            {certifications && <span className="block font-semibold">Certifications: {certifications}</span>}
            {experience && <span className="block font-semibold">Experience: {experience}</span>}
          </div>
        )}
      </div>
      <div className="w-full max-w-8xl text-black flex flex-row gap-8">
        <div className="flex-1">
          <InstructorCalendar schedule={rawSchedule} onScheduleUpdate={fetchSchedule} />
        </div>
      </div>
    </div>
  );
}
