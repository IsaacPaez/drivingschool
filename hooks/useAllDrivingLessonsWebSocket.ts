import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
  status: string;
  classType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  selectedProduct?: string;
  studentId?: string;
  studentName?: string;
  paid?: boolean;
}

interface InstructorScheduleData {
  type: 'initial' | 'update' | 'error' | 'instructor_update';
  instructorId?: string;
  schedule?: ScheduleEntry[];
  allSchedules?: Record<string, ScheduleEntry[]>;
  message?: string;
}

export function useAllDrivingLessonsWebSocket(instructorIds: string[]) {
  const [schedules, setSchedules] = useState<Map<string, ScheduleEntry[]>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [connections, setConnections] = useState<Map<string, boolean>>(new Map());

  // Create WebSocket URL for all instructors
  const wsUrl = instructorIds.length > 0
    ? `${process.env.NODE_ENV === 'production' ? 'wss:' : 'ws:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/ws/driving-lessons-updates?instructorIds=${instructorIds.join(',')}`
    : '';

  const {
    data,
    error: wsError,
    isConnected: wsConnected,
    isConnecting,
    sendMessage,
    disconnect
  } = useWebSocket<InstructorScheduleData>({
    url: wsUrl,
    shouldConnect: instructorIds.length > 0,
    reconnectAttempts: 5,
    reconnectInterval: 2000
  });

  // Handle WebSocket data updates
  useEffect(() => {
    if (data) {
      console.log('📡 Driving Lessons WebSocket data received:', data.type);
      
      if (data.type === 'initial' && data.allSchedules) {
        // Initial load of all schedules
        const newSchedules = new Map<string, ScheduleEntry[]>();
        const newConnections = new Map<string, boolean>();
        
        Object.entries(data.allSchedules).forEach(([instructorId, schedule]) => {
          newSchedules.set(instructorId, schedule);
          newConnections.set(instructorId, true);
        });
        
        setSchedules(newSchedules);
        setConnections(newConnections);
        setErrors(new Map()); // Clear errors on successful initial load
        
        console.log('📅 Initial schedules loaded for', newSchedules.size, 'instructors');
        
      } else if (data.type === 'instructor_update' && data.instructorId && data.schedule) {
        // Update for specific instructor
        setSchedules(prev => {
          const newSchedules = new Map(prev);
          newSchedules.set(data.instructorId!, data.schedule!);
          return newSchedules;
        });
        
        setConnections(prev => {
          const newConnections = new Map(prev);
          newConnections.set(data.instructorId!, true);
          return newConnections;
        });
        
        console.log('📅 Schedule updated for instructor:', data.instructorId, '- slots:', data.schedule.length);
        
      } else if (data.type === 'error') {
        console.log('❌ Driving Lessons WebSocket Error:', data.message);
        
        if (data.instructorId) {
          // Error for specific instructor
          setErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.set(data.instructorId!, data.message || 'Unknown error occurred');
            return newErrors;
          });
          
          setConnections(prev => {
            const newConnections = new Map(prev);
            newConnections.set(data.instructorId!, false);
            return newConnections;
          });
        } else {
          // General error
          const generalError = data.message || 'Unknown error occurred';
          const newErrors = new Map<string, string>();
          instructorIds.forEach(id => newErrors.set(id, generalError));
          setErrors(newErrors);
        }
      }
    }
  }, [data, instructorIds]);

  // Handle WebSocket connection state
  useEffect(() => {
    if (wsConnected) {
      // Mark all instructors as connected when WebSocket connects
      const newConnections = new Map<string, boolean>();
      instructorIds.forEach(id => newConnections.set(id, true));
      setConnections(newConnections);
    } else {
      // Mark all as disconnected when WebSocket disconnects
      const newConnections = new Map<string, boolean>();
      instructorIds.forEach(id => newConnections.set(id, false));
      setConnections(newConnections);
    }
  }, [wsConnected, instructorIds]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      const newErrors = new Map<string, string>();
      instructorIds.forEach(id => newErrors.set(id, wsError));
      setErrors(newErrors);
    }
  }, [wsError, instructorIds]);

  // Clear data when instructorIds change
  useEffect(() => {
    if (instructorIds.length === 0) {
      setSchedules(new Map());
      setErrors(new Map());
      setConnections(new Map());
    }
  }, [instructorIds]);

  // Request fresh data when connected
  const requestUpdate = useCallback((instructorId?: string) => {
    if (wsConnected) {
      sendMessage({
        type: 'request_update',
        instructorId,
        instructorIds: instructorId ? undefined : instructorIds
      });
    }
  }, [wsConnected, instructorIds, sendMessage]);

  // Helper functions
  const getScheduleForInstructor = useCallback((instructorId: string): ScheduleEntry[] => {
    return schedules.get(instructorId) || [];
  }, [schedules]);

  const getErrorForInstructor = useCallback((instructorId: string): string | null => {
    return errors.get(instructorId) || null;
  }, [errors]);

  const isConnectedForInstructor = useCallback((instructorId: string): boolean => {
    return connections.get(instructorId) || false;
  }, [connections]);

  const getAllSchedules = useCallback((): Map<string, ScheduleEntry[]> => {
    return new Map(schedules);
  }, [schedules]);

  return {
    getScheduleForInstructor,
    getErrorForInstructor,
    isConnectedForInstructor,
    getAllSchedules,
    isConnecting,
    disconnect,
    requestUpdate
  };
}
