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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ID del instructor Isaac
    const instructorId = '681c2566f4e0eb5564f85205';
    setLoading(true);
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
          setLoading(false);
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
            // Forzar la fecha a local (no UTC)
            const baseDate = new Date(`${item.date}T00:00:00`);
            return Array.from({ length: endHour - startHour }, (_, i) => ({
              date: new Date(baseDate),
              hour: startHour + i,
              status: slot.status || 'scheduled',
              slotId: slot._id
            }));
          })
        );
        setSchedule(adapted);
        setLoading(false);
      });
  }, []);

  const fetchSchedule = async () => {
    const instructorId = '681c2566f4e0eb5564f85205';
    const res = await fetch(`/api/teachers?id=${instructorId}`);
    const data = await res.json();
    setRawSchedule(data.schedule || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1]">
        <div className="flex flex-col items-center">
          {/* SVG volante animado */}
          <svg className="animate-spin h-16 w-16 text-[#0056b3] mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" stroke="#0056b3" strokeWidth="6" opacity="0.2" />
            <path d="M32 8a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm0 0v12m0 24v12m-17-17h12m24 0h12M16.93 16.93l8.49 8.49m12.12 12.12l8.49 8.49M16.93 47.07l8.49-8.49m12.12-12.12l8.49-8.49" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="32" r="6" fill="#0056b3" />
          </svg>
          <span className="text-[#0056b3] text-lg font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center">
      <div className="flex items-center justify-between w-full px-8 py-4">
        <div className="flex items-center gap-3">
          <img
            src={instructorPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(instructorName || "Teacher")}
            alt={instructorName}
            className="w-12 h-12 rounded-full border-2 border-[#0056b3] bg-white object-cover"
          />
          <span className="font-bold text-[#0056b3] text-lg">{instructorName}</span>
        </div>
        <button
          onClick={() => {
            import('next-auth/react').then(mod => mod.signOut({ callbackUrl: '/' }));
          }}
          className="ml-auto px-4 py-2 rounded bg-red-600 text-white font-semibold shadow hover:bg-red-800 transition-all"
        >
          Cerrar sesión
        </button>
      </div>
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
