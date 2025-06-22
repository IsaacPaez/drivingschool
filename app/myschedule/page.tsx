'use client';
import { useEffect, useState } from 'react';
import InstructorCalendar from '../../components/TeachersCalendar/InstructorCalendar';
import AuthRedirector from "../components/AuthRedirector";
import { useRouter } from "next/navigation";
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from "@/components/AuthContext";

export default function TeachersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rawSchedule, setRawSchedule] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const instructorId = (user as { instructorId?: string })?.instructorId;

  useEffect(() => {
    if (user === null) {
      router.replace("/");
      return;
    }
    if ((user as any)?.type !== "instructor") {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!instructorId) return;

    const eventSource = new EventSource(`/api/teachers/schedule-updates?id=${instructorId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'initial' || data.type === 'update') {
        setRawSchedule(data.schedule || []);
        if (loading) setLoading(false);
      } else if (data.type === 'error') {
        console.error("SSE Error:", data.message);
        if (loading) setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      if (loading) setLoading(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [instructorId, loading]);

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
            <InstructorCalendar schedule={rawSchedule} onScheduleUpdate={() => {}} />
          </div>
        </div>
      </div>
    </>
  );
}
