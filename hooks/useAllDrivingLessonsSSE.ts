import { useEffect, useRef, useState, useCallback } from 'react';

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
  const reconnectTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const reconnectAttempts = useRef<Map<string, number>>(new Map());

  const createConnection = useCallback((instructorId: string) => {
    // Clear any existing timeout
    const existingTimeout = reconnectTimeouts.current.get(instructorId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      reconnectTimeouts.current.delete(instructorId);
    }

    // Close existing connection if any
    const existingConnection = eventSourceRefs.current.get(instructorId);
    if (existingConnection) {
      existingConnection.close();
    }

    const eventSource = new EventSource(`/api/driving-lessons/schedule-updates?id=${instructorId}`);
    eventSourceRefs.current.set(instructorId, eventSource);

    eventSource.onopen = () => {
      setConnections(prev => new Map(prev.set(instructorId, true)));
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(instructorId);
        return newErrors;
      });
      // Reset reconnect attempts on successful connection
      reconnectAttempts.current.set(instructorId, 0);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ScheduleData = JSON.parse(event.data);
        
        // Only log initial data, not every update to reduce console spam
        if (data.type === 'initial') {
          console.log("📡 Driving Lessons SSE initial data received for instructor", instructorId, ":", data.schedule?.length || 0, "slots");
        }
        
        if (data.type === 'initial' || data.type === 'update') {
          if (data.schedule) {
            setSchedules(prev => new Map(prev.set(instructorId, data.schedule!)));
          }
        } else if (data.type === 'error') {
          // Only log actual server errors, not connection issues
          if (data.message && !data.message.includes('Connection') && !data.message.includes('reconnect')) {
            console.log("❌ Driving Lessons SSE Error for instructor", instructorId, ":", data.message);
          }
        }
      } catch {
        // Silently handle parse errors - they're usually from connection drops
      }
    };

    eventSource.onerror = () => {
      setConnections(prev => new Map(prev.set(instructorId, false)));
      
      // Implement exponential backoff for reconnection
      const attempts = reconnectAttempts.current.get(instructorId) || 0;
      const maxAttempts = 5;
      
      if (attempts < maxAttempts) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30 seconds
        reconnectAttempts.current.set(instructorId, attempts + 1);
        
        const timeout = setTimeout(() => {
          if (instructorIds.includes(instructorId)) {
            createConnection(instructorId);
          }
        }, backoffTime);
        
        reconnectTimeouts.current.set(instructorId, timeout);
      }
    };
  }, [instructorIds]);

  useEffect(() => {
    // Only reconnect if the instructor IDs have actually changed
    const currentIds = Array.from(eventSourceRefs.current.keys()).sort();
    const newIds = [...instructorIds].sort();
    
    // Check if the arrays are the same
    if (currentIds.length === newIds.length && 
        currentIds.every((id, index) => id === newIds[index])) {
      return;
    }

    // Clean up all existing connections and timeouts
    const currentEventSources = eventSourceRefs.current;
    const currentTimeouts = reconnectTimeouts.current;
    const currentAttempts = reconnectAttempts.current;
    
    currentEventSources.forEach((eventSource) => {
      eventSource.close();
    });
    currentEventSources.clear();
    
    currentTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    currentTimeouts.clear();
    currentAttempts.clear();
    
    setSchedules(new Map());
    setErrors(new Map());
    setConnections(new Map());

    if (instructorIds.length === 0) {
      return;
    }

    // Create SSE connections for each instructor
    instructorIds.forEach((instructorId) => {
      createConnection(instructorId);
    });

    // Cleanup function
    return () => {
      currentEventSources.forEach((eventSource) => {
        eventSource.close();
      });
      currentEventSources.clear();
      
      currentTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      currentTimeouts.clear();
      currentAttempts.clear();
      
      setConnections(new Map());
    };
  }, [instructorIds, createConnection]);

  // Manual cleanup function
  const disconnect = useCallback(() => {
    eventSourceRefs.current.forEach((eventSource) => {
      eventSource.close();
    });
    eventSourceRefs.current.clear();
    setConnections(new Map());
  }, []);

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
