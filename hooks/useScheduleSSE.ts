import { useEffect, useRef, useState } from 'react';

interface ScheduleData {
  type: 'initial' | 'update' | 'error';
  schedule?: unknown[];
  message?: string;
}

export function useScheduleSSE(instructorId: string | null) {
  const [schedule, setSchedule] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!instructorId) {
      setSchedule([]);
      setError(null);
      setIsConnected(false);
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const eventSource = new EventSource(`/api/book-now/schedule-updates?id=${instructorId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ScheduleData = JSON.parse(event.data);
        console.log("📡 SSE data received for instructor", instructorId, ":", data);
        
        if (data.type === 'initial' || data.type === 'update') {
          if (data.schedule) {
            console.log("📅 Setting schedule:", data.schedule.length, "slots");
            setSchedule(data.schedule);
          }
        } else if (data.type === 'error') {
          console.log("❌ SSE Error:", data.message);
          setError(data.message || 'Unknown error occurred');
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
        setError('Failed to parse server data');
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      setError('Connection lost. Trying to reconnect...');
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

  // Manual cleanup function
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  };

  return {
    schedule,
    error,
    isConnected,
    disconnect
  };
} 