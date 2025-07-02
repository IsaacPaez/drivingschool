"use client";

import { useState, useEffect, useRef } from 'react';

interface AllSchedulesData {
  adi: any[];
  bdi: any[];
  date: any[];
}

interface UseAllSchedulesSSEReturn {
  schedules: AllSchedulesData;
  error: string | null;
  isConnected: boolean;
}

export function useAllSchedulesSSE(instructorId: string | null): UseAllSchedulesSSEReturn {
  const [schedules, setSchedules] = useState<AllSchedulesData>({
    adi: [],
    bdi: [],
    date: []
  });
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!instructorId) {
      setSchedules({ adi: [], bdi: [], date: [] });
      setError(null);
      setIsConnected(false);
      return;
    }

    console.log(`🚀 Starting ALL schedules SSE for instructor: ${instructorId}`);

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/register-online/all-schedules?id=${instructorId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ ALL Schedules SSE connection opened');
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 ALL Schedules SSE data received:', data);

        if (data.type === 'complete') {
          setSchedules({
            adi: data.adi || [],
            bdi: data.bdi || [],
            date: data.date || []
          });
        } else if (data.type === 'error') {
          setError(data.message);
        }
      } catch (err) {
        console.error('❌ Error parsing ALL schedules SSE data:', err);
        setError('Failed to parse schedule data');
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ ALL Schedules SSE error:', err);
      setError('Connection error');
      setIsConnected(false);
    };

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [instructorId]);

  return { schedules, error, isConnected };
}
