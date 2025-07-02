import { useState, useEffect, useRef } from 'react';

interface TicketClass {
  _id: string;
  type: string;
  hour: string;
  endHour: string;
  duration: string;
  date: string;
  cupos: number;
  status: string;
  availableSpots: number;
  enrolledStudents: number;
  totalSpots: number;
  students: any[];
  classInfo?: {
    _id: string;
    title: string;
    overview: string;
  };
  instructorInfo?: {
    _id: string;
    name: string;
    email: string;
    photo: string;
  };
}

interface SSEData {
  type: 'initial' | 'update' | 'error';
  ticketClasses?: TicketClass[];
  message?: string;
}

export const useRegisterOnlineSSE = (instructorId: string | null, classType: string = 'ALL') => {
  const [ticketClasses, setTicketClasses] = useState<TicketClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!instructorId) {
      setTicketClasses([]);
      setError(null);
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsLoading(true);
    setError(null);

    // Create new EventSource connection
    const eventSource = new EventSource(`/api/register-online/ticket-classes-sse?instructorId=${instructorId}&type=${classType}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEData = JSON.parse(event.data);
        
        if (data.type === 'initial' || data.type === 'update') {
          if (data.ticketClasses) {
            setTicketClasses(data.ticketClasses);
            setIsLoading(false);
          }
        } else if (data.type === 'error') {
          setError(data.message || 'Unknown error occurred');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
        setError('Failed to parse server data');
        setIsLoading(false);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      setError('Connection lost. Trying to reconnect...');
      setIsConnected(false);
      setIsLoading(false);
    };

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      setIsLoading(false);
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
    ticketClasses,
    isLoading,
    error,
    isConnected,
    disconnect
  };
}

// Add this for backward compatibility with default import
export default useRegisterOnlineSSE;
