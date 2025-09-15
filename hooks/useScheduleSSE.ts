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
  const [hasInitial, setHasInitial] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!instructorId) {
      setSchedule([]);
      setError(null);
      setIsConnected(false);
      setHasInitial(false);
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection (absolute URL for production reliability)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const eventSource = new EventSource(`${baseUrl}/api/book-now/schedule-updates?id=${instructorId}`);
    eventSourceRef.current = eventSource;
    setHasInitial(false);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ScheduleData = JSON.parse(event.data);
        
        if (data.type === 'initial' || data.type === 'update') {
          if (data.schedule) {
            // console.log("📅 Setting schedule:", data.schedule.length, "slots");
            setSchedule(data.schedule);
          }
          // Mark stream as ready once we receive any payload
          if (!hasInitial) {
            setHasInitial(true);
          }
        } else if (data.type === 'error') {
          setError(data.message || 'Unknown error occurred');
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
        setError('Failed to parse server data');
      }
    };

    eventSource.onerror = (event) => {
      // Do not manually close/recreate; let EventSource auto-retry.
      // Just reflect the transient state in UI.
      console.warn('SSE connection issue, browser will retry automatically.', event);
      setError('Connection issue. Reconnecting...');
      setIsConnected(false);
    };

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      setHasInitial(false);
    };
  // It's important that hasInitial is not a dependency here to avoid recreating the stream
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
    isReady: hasInitial,
    disconnect
  };
} 