'use client';
import { useEffect, useState } from 'react';
import InstructorCalendar from '../../components/TeachersCalendar/InstructorCalendar';
import MiniCalendar from '../../components/TeachersCalendar/MiniCalendar';
import { signOut, useSession } from "next-auth/react";
import { useState as useReactState } from "react";
import AuthRedirector from "../components/AuthRedirector";
import { useRouter } from "next/navigation";

// Custom hook para polling tipo webhook
function useWebhook(instructorId: string | undefined, onUpdate: (data: any) => void) {
  useEffect(() => {
    if (!instructorId) return;
    const fetchAndUpdate = () => {
      fetch(`/api/teachers?id=${instructorId}`)
        .then(res => res.json())
        .then(onUpdate);
    };
    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 5000);
    return () => clearInterval(interval);
  }, [instructorId, onUpdate]);
}

export default function TeachersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  const [instructorName, setInstructorName] = useState('');
  const [instructorPhoto, setInstructorPhoto] = useState('');
  const [certifications, setCertifications] = useState('');
  const [experience, setExperience] = useState('');
  const [rawSchedule, setRawSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useReactState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.replace("/api/auth/signin/auth0?callbackUrl=/teachers");
      return;
    }
    if ((session.user as any).role !== "instructor") {
      router.replace("/");
    }
  }, [session, status, router]);

  // Hook profesional para actualización en vivo
  const instructorId = (session?.user as any)?.instructorId;
  useWebhook(
    instructorId,
    (data) => {
      setRawSchedule(data.schedule || []);
      const adapted = (data.schedule || []).flatMap((item: any) =>
        (item.slots || []).flatMap((slot: any) => {
          const startHour = parseInt(slot.start.split(':')[0], 10);
          const endHour = parseInt(slot.end.split(':')[0], 10);
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
      // Solo desactiva loading la primera vez
      setLoading((prev) => prev ? false : prev);
    }
  );

  const fetchSchedule = async () => {
    if (!session?.user) return;
    const instructorId = (session.user as any).instructorId;
    if (!instructorId) return;
    
    const res = await fetch(`/api/teachers?id=${instructorId}`);
    const data = await res.json();
    setRawSchedule(data.schedule || []);
  };

  if (status === "loading" || !session || !session.user || (session.user as any).role !== "instructor") {
    return null;
  }

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
    <>
      <AuthRedirector />
      <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center mt-28">
        <h1 className="text-4xl font-extrabold text-center mb-8 select-none">
          <span className="text-[#0056b3]">INSTRUCTOR</span>{' '}
          <span className="text-[#27ae60]">SCHEDULE</span>
        </h1>
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
    </>
  );
}
