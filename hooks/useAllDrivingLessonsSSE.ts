import { useEffect, useRef, useState } from 'react';

interface ScheduleData {
  type: 'initial' | 'update' | 'error';
  schedule?: unknown[];
  message?: string;
}

interface InstructorSchedule {
  instructorId: string;
  schedule: unknown[];
}

export function useAllDrivingLessonsSSE(instructorIds: string[]) {
  const [schedules, setSchedules] = useState<Map<string, unknown[]>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [connections, setConnections] = useState<Map<string, boolean>>(new Map());
  const eventSourceRefs = useRef<Map<string, EventSource>>(new Map());

  useEffect(() => {
    // Only reconnect if the instructor IDs have actually changed
    const currentIds = Array.from(eventSourceRefs.current.keys()).sort();
    const newIds = [...instructorIds].sort();
    
    // Check if the arrays are the same
    if (currentIds.length === newIds.length && 
        currentIds.every((id, index) => id === newIds[index])) {
      console.log("🔄 Instructor IDs unchanged, keeping existing SSE connections");
      return;
    }

    // Close all existing connections
    eventSourceRefs.current.forEach((eventSource) => {
      eventSource.close();
    });
    eventSourceRefs.current.clear();
    setSchedules(new Map());
    setErrors(new Map());
    setConnections(new Map());

    if (instructorIds.length === 0) {
      return;
    }

    console.log("🔄 Setting up NEW SSE connections for driving lessons instructors:", instructorIds);

    // Create SSE connections for each instructor
    instructorIds.forEach((instructorId) => {
      const eventSource = new EventSource(`/api/driving-lessons/schedule-updates?id=${instructorId}`);
      eventSourceRefs.current.set(instructorId, eventSource);

      eventSource.onopen = () => {
        setConnections(prev => new Map(prev.set(instructorId, true)));
        setErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.delete(instructorId);
          return newErrors;
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ScheduleData = JSON.parse(event.data);
          
          // Only log initial data, not every update to reduce console spam
          if (data.type === 'initial') {
            console.log("📡 Driving Lessons SSE initial data received for instructor", instructorId, ":", data.schedule?.length || 0, "slots");
          } else if (data.type === 'update') {
            console.log("📡 Driving Lessons SSE update received for instructor", instructorId, ":", data.schedule?.length || 0, "slots");
          }
          
          if (data.type === 'initial' || data.type === 'update') {
            if (data.schedule) {
              setSchedules(prev => new Map(prev.set(instructorId, data.schedule!)));
            }
          } else if (data.type === 'error') {
            console.log("❌ Driving Lessons SSE Error for instructor", instructorId, ":", data.message);
            setErrors(prev => new Map(prev.set(instructorId, data.message || 'Unknown error occurred')));
          }
        } catch (err) {
          console.error('Error parsing driving lessons SSE data for instructor', instructorId, ':', err);
          setErrors(prev => new Map(prev.set(instructorId, 'Failed to parse server data')));
        }
      };

      eventSource.onerror = (event) => {
        console.error('Driving lessons SSE connection error for instructor', instructorId, ':', event);
        setErrors(prev => new Map(prev.set(instructorId, 'Connection lost. Trying to reconnect...')));
        setConnections(prev => new Map(prev.set(instructorId, false)));
      };
    });

    // Cleanup function
    return () => {
      eventSourceRefs.current.forEach((eventSource) => {
        eventSource.close();
      });
      eventSourceRefs.current.clear();
      setConnections(new Map());
    };
  }, [instructorIds.join(',')]);

  // Manual cleanup function
  const disconnect = () => {
    eventSourceRefs.current.forEach((eventSource) => {
      eventSource.close();
    });
    eventSourceRefs.current.clear();
    setConnections(new Map());
  };

  // Get schedule for a specific instructor
  const getScheduleForInstructor = (instructorId: string): unknown[] => {
    return schedules.get(instructorId) || [];
  };

  // Get error for a specific instructor
  const getErrorForInstructor = (instructorId: string): string | null => {
    return errors.get(instructorId) || null;
  };

  // Check if connected for a specific instructor
  const isConnectedForInstructor = (instructorId: string): boolean => {
    return connections.get(instructorId) || false;
  };

  // Get all schedules as an array
  const getAllSchedules = (): InstructorSchedule[] => {
    return Array.from(schedules.entries()).map(([instructorId, schedule]) => ({
      instructorId,
      schedule
    }));
  };

  return {
    schedules,
    errors,
    connections,
    getScheduleForInstructor,
    getErrorForInstructor,
    isConnectedForInstructor,
    getAllSchedules,
    disconnect
  };
}
