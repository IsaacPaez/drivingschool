"use client";

import { useEffect } from "react";

interface UseScheduleDataProps {
  selectedInstructorId: string | null;
  selectedClassType: string;
  instructors: any[];
  sseSchedule: any[];
  setSelectedInstructor: (instructor: any) => void;
  mapClassTypeToDb: (type: string) => string;
  preloadClassData: (schedule: any[]) => Promise<void>;
}

export function useScheduleData({
  selectedInstructorId,
  selectedClassType,
  instructors,
  sseSchedule,
  setSelectedInstructor,
  mapClassTypeToDb,
  preloadClassData
}: UseScheduleDataProps) {
  
  // Fallback direct fetch function
  const fetchScheduleDirectly = async () => {
    if (!selectedInstructorId || !selectedClassType) return;
    
    try {
      const dbClassType = mapClassTypeToDb(selectedClassType);
      const url = `/api/schedule/${selectedInstructorId}?classType=${dbClassType}`;
      console.log('🔄 FETCHING DIRECTLY:', url);
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ DIRECT FETCH SUCCESS:', data);
        
        // Find base instructor and update with schedule
        const base = instructors.find(i => i._id === selectedInstructorId);
        if (base) {
          const instructorWithSchedule = { ...base, schedule: data };
          setSelectedInstructor(instructorWithSchedule);
          console.log('📅 DIRECT SCHEDULE SET:', data);
          
          // Preload all class data for this schedule
          await preloadClassData(data);
        }
      } else {
        console.error('❌ Direct fetch failed:', res.status);
      }
    } catch (error) {
      console.error('❌ Direct fetch error:', error);
    }
  };

  // Process SSE schedule data
  useEffect(() => {
    if (!selectedInstructorId) return;
    
    console.log("✅ Processing SSE schedule data:", sseSchedule);
    
    // Find base instructor and update with schedule
    const base = instructors.find(i => i._id === selectedInstructorId);
    if (base) {
      if (Array.isArray(sseSchedule) && sseSchedule.length > 0) {
        const instructorWithSchedule = { ...base, schedule: sseSchedule };
        setSelectedInstructor(instructorWithSchedule);
        console.log('📅 SSE SCHEDULE SET:', sseSchedule);
        
        // Preload all class data for this schedule
        preloadClassData(sseSchedule);
      } else {
        // If no SSE data, try direct fetch as fallback
        console.log('🔄 No SSE data, trying direct fetch...');
        fetchScheduleDirectly();
      }
    }
  }, [selectedInstructorId, sseSchedule, instructors, preloadClassData]);

  return { fetchScheduleDirectly };
}
