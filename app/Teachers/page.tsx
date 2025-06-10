'use client';
import { useEffect, useState } from 'react';
import InstructorCalendar from '../../components/TeachersCalendar/InstructorCalendar';
import AuthRedirector from "../components/AuthRedirector";
import { useRouter } from "next/navigation";
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from "@/components/AuthContext";

// Custom hook para polling tipo webhook
function useWebhook(instructorId: string | undefined, onUpdate: (data: unknown) => void) {
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
  const router = useRouter();
  const { user } = useAuth();
  const [rawSchedule, setRawSchedule] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.replace("/sign-in");
      return;
    }
    if ((user as any)?.type !== "instructor") {
      router.replace("/");
    }
  }, [user, router]);

  // Hook profesional para actualización en vivo
  const instructorId = (user as { instructorId?: string })?.instructorId;
  useWebhook(
    instructorId,
    (data) => {
      setRawSchedule((data as { schedule?: unknown[] }).schedule || []);
      // Solo desactiva loading la primera vez
      setLoading((prev) => prev ? false : prev);
    }
  );

  const fetchSchedule = async () => {
    if (user === null) return;
    const instructorId = (user as { instructorId?: string }).instructorId;
    if (!instructorId) return;
    
    const res = await fetch(`/api/teachers?id=${instructorId}`);
    const data = await res.json();
    setRawSchedule((data as { schedule?: unknown[] }).schedule || []);
  };

  if (user === null) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <AuthRedirector />
      <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-center mb-8 select-none">
          <span className="text-[#0056b3]">INSTRUCTOR</span>{' '}
          <span className="text-[#27ae60]">SCHEDULE</span>
        </h1>
        <div className="w-full max-w-8xl text-black flex flex-row gap-8">
          <div className="flex-1">
            <InstructorCalendar schedule={rawSchedule} onScheduleUpdate={fetchSchedule} />
          </div>
        </div>
      </div>
    </>
  );
}
