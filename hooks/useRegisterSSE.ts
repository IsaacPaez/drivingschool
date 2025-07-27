import { useEffect, useRef, useState } from 'react';

interface ScheduleData {
  type: 'initial' | 'update' | 'error';
  schedule?: any[];
  message?: string;
}

export function useRegisterSSE(instructorId: string | null, classType: string | null) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!instructorId || !classType) {
      setSchedule([]);
      setError(null);
      setIsConnected(false);
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Map frontend class types to database class types
    const mapClassTypeToDb = (frontendType: string) => {
      if (frontendType === 'ADI') return 'A.D.I';
      if (frontendType === 'BDI') return 'B.D.I';  
      if (frontendType === 'DATE') return 'D.A.T.E';
      return frontendType;
    };

    const dbClassType = mapClassTypeToDb(classType);

    // Create new EventSource connection
    const eventSource = new EventSource(`/api/register-online/schedule-updates?id=${instructorId}&classType=${encodeURIComponent(dbClassType)}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log(`📡 SSE connected for instructor ${instructorId} with class type ${dbClassType}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ScheduleData = JSON.parse(event.data);
        console.log("📡 Register SSE data received:", data);
        
        if (data.type === 'initial' || data.type === 'update') {
          if (data.schedule) {
            // console.log("📅 Setting register schedule:", data.schedule);
            setSchedule(data.schedule);
          }
        } else if (data.type === 'error') {
          setError(data.message || 'Unknown error occurred');
        }
      } catch (err) {
        console.error('Error parsing register SSE data:', err);
        setError('Failed to parse server data');
      }
    };

    eventSource.onerror = (event) => {
      console.error('Register SSE connection error:', event);
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
  }, [instructorId, classType]);

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
