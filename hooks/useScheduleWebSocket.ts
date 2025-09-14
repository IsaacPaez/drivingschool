import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface SlotWithDate {
  _id: string;
  date: string;
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled' | 'available' | 'pending' | 'booked';
  studentId?: string;
  booked?: boolean;
  classType?: string;
  amount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
}

interface ScheduleData {
  type: 'initial' | 'update' | 'error';
  schedule?: SlotWithDate[];
  message?: string;
}

export function useScheduleWebSocket(instructorId: string | null) {
  const [schedule, setSchedule] = useState<SlotWithDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Create WebSocket URL
  const wsUrl = instructorId 
    ? `${process.env.NODE_ENV === 'production' ? 'wss:' : 'ws:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/ws/schedule-updates?id=${instructorId}&type=driving_test`
    : '';

  const {
    data,
    error: wsError,
    isConnected: wsConnected,
    isConnecting,
    sendMessage,
    disconnect
  } = useWebSocket<ScheduleData>({
    url: wsUrl,
    shouldConnect: !!instructorId,
    reconnectAttempts: 5,
    reconnectInterval: 2000
  });

  // Handle WebSocket data updates
  useEffect(() => {
    if (data) {
      console.log('📡 Schedule WebSocket data received for instructor', instructorId, ':', data);
      
      if (data.type === 'initial' || data.type === 'update') {
        if (data.schedule) {
          console.log('📅 Setting schedule:', data.schedule.length, 'slots');
          setSchedule(data.schedule);
          setError(null);
        }
      } else if (data.type === 'error') {
        console.log('❌ Schedule WebSocket Error:', data.message);
        setError(data.message || 'Unknown error occurred');
      }
    }
  }, [data, instructorId]);

  // Handle WebSocket connection state
  useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      setError(wsError);
    }
  }, [wsError]);

  // Clear data when instructorId changes or is null
  useEffect(() => {
    if (!instructorId) {
      setSchedule([]);
      setError(null);
      setIsConnected(false);
    }
  }, [instructorId]);

  // Request fresh data when connected
  const requestUpdate = useCallback(() => {
    if (isConnected && instructorId) {
      sendMessage({
        type: 'request_update',
        instructorId,
        classType: 'driving_test'
      });
    }
  }, [isConnected, instructorId, sendMessage]);

  return {
    schedule,
    error,
    isConnected,
    isConnecting,
    disconnect,
    requestUpdate
  };
}
