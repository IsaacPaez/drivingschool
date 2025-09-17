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

// Global connection manager for driving lessons
const globalDrivingLessonsConnections = new Map<string, {
  eventSource: EventSource;
  refCount: number;
  lastUsed: number;
}>();

const cleanupDrivingLessonsInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, conn] of globalDrivingLessonsConnections.entries()) {
    if (now - conn.lastUsed > 30000) { // 30 seconds idle
      conn.eventSource.close();
      globalDrivingLessonsConnections.delete(key);
    }
  }
}, 10000);

// Mark as used to prevent ESLint warning
if (typeof cleanupDrivingLessonsInterval === 'undefined') {
  console.log('Cleanup interval not defined');
}

export function useAllDrivingLessonsSSE(instructorIds: string[]) {
  const [schedules, setSchedules] = useState<Map<string, unknown[]>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [connections, setConnections] = useState<Map<string, boolean>>(new Map());
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!mountedRef.current) return;

    // Clean up old connections that are no longer needed
    const currentConnections = Array.from(globalDrivingLessonsConnections.keys());
    const connectionsToRemove = currentConnections.filter(id => !instructorIds.includes(id));
    
    connectionsToRemove.forEach(instructorId => {
      const connection = globalDrivingLessonsConnections.get(instructorId);
      if (connection) {
        connection.eventSource.close();
        globalDrivingLessonsConnections.delete(instructorId);
      }
    });

    // Create connections for new instructor IDs
    instructorIds.forEach(instructorId => {
      const connectionKey = `driving-lessons-${instructorId}`;
      let connection = globalDrivingLessonsConnections.get(connectionKey);
      
      if (!connection) {
        const eventSource = new EventSource(`/api/driving-lessons/schedule-updates?id=${instructorId}`);
        
        connection = {
          eventSource,
          refCount: 0,
          lastUsed: Date.now()
        };
        
        globalDrivingLessonsConnections.set(connectionKey, connection);
        
        eventSource.onopen = () => {
          if (mountedRef.current) {
            setConnections(prev => new Map(prev.set(instructorId, true)));
            setErrors(prev => {
              const newErrors = new Map(prev);
              newErrors.delete(instructorId);
              return newErrors;
            });
          }
        };
        
        eventSource.onmessage = (event) => {
          if (!mountedRef.current) return;
          
          try {
            const data: ScheduleData = JSON.parse(event.data);
            
            if (data.type === 'initial' || data.type === 'update') {
              if (data.schedule) {
                setSchedules(prev => new Map(prev.set(instructorId, data.schedule!)));
              }
            } else if (data.type === 'error') {
              if (data.message && !data.message.includes('Connection') && !data.message.includes('reconnect')) {
                setErrors(prev => new Map(prev.set(instructorId, data.message!)));
              }
            }
          } catch {
            // Silently handle parse errors
          }
        };
        
        eventSource.onerror = () => {
          if (mountedRef.current) {
            setConnections(prev => new Map(prev.set(instructorId, false)));
          }
        };
      }
      
      // Increment reference count
      connection.refCount++;
      connection.lastUsed = Date.now();
    });

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      instructorIds.forEach(instructorId => {
        const connectionKey = `driving-lessons-${instructorId}`;
        const connection = globalDrivingLessonsConnections.get(connectionKey);
        
        if (connection) {
          connection.refCount--;
          connection.lastUsed = Date.now();
          
          // Close connection if no more references
          if (connection.refCount <= 0) {
            connection.eventSource.close();
            globalDrivingLessonsConnections.delete(connectionKey);
          }
        }
      });
      
      setConnections(new Map());
    };
  }, [instructorIds]);

  // Manual cleanup function
  const disconnect = useCallback(() => {
    globalDrivingLessonsConnections.forEach((connection) => {
      connection.eventSource.close();
    });
    globalDrivingLessonsConnections.clear();
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
