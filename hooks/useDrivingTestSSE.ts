import { useEffect, useRef, useState } from 'react';

interface DrivingTestSlot {
  _id: string;
  date: string;
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled' | 'available' | 'pending' | 'booked';
  studentId?: string;
  studentName?: string;
  booked?: boolean;
  classType?: string;
  amount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
  paymentMethod?: string;
  reservedAt?: string;
  orderId?: string;
  orderNumber?: string;
}

interface ScheduleData {
  type: 'initial' | 'update' | 'error';
  schedule?: DrivingTestSlot[];
  message?: string;
}

// Global connection manager to prevent multiple connections
const globalConnections = new Map<string, {
  eventSource: EventSource;
  refCount: number;
  lastUsed: number;
}>();

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, conn] of globalConnections.entries()) {
    if (now - conn.lastUsed > 30000) { // 30 seconds idle
      conn.eventSource.close();
      globalConnections.delete(key);
    }
  }
}, 10000);

export function useDrivingTestSSE(instructorId: string | null) {
  const [schedule, setSchedule] = useState<DrivingTestSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasInitial, setHasInitial] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!instructorId) {
      setSchedule([]);
      setError(null);
      setIsConnected(false);
      setHasInitial(false);
      return;
    }

    const connectionKey = `driving-test-${instructorId}`;
    
    // Check if connection already exists
    let connection = globalConnections.get(connectionKey);
    
    if (!connection) {
      // Create new connection
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const eventSource = new EventSource(`${baseUrl}/api/sse/driving-test-schedule?instructorId=${instructorId}`);
      
      connection = {
        eventSource,
        refCount: 0,
        lastUsed: Date.now()
      };
      
      globalConnections.set(connectionKey, connection);
      
      eventSource.onopen = () => {
        if (mountedRef.current) {
          console.log('🔌 SSE Connected for driving test schedule');
          setIsConnected(true);
          setError(null);
        }
      };
      
      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const data: ScheduleData = JSON.parse(event.data);
          console.log('📡 SSE Data received for driving test:', data);
          
          if (data.type === 'initial' || data.type === 'update') {
            if (data.schedule) {
              setSchedule(data.schedule);
            }
            if (!hasInitial) setHasInitial(true);
          } else if (data.type === 'error') {
            setError(data.message || 'Unknown error occurred');
          }
        } catch (err) {
          console.error('❌ Error parsing SSE data:', err);
          setError('Failed to parse schedule data');
        }
      };
      
      eventSource.onerror = () => {
        if (mountedRef.current) {
          console.error('❌ SSE Error for driving test');
          setIsConnected(false);
          setError('Connection issue. Reconnecting...');
        }
      };
    }
    
    // Increment reference count
    connection.refCount++;
    connection.lastUsed = Date.now();
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      if (connection) {
        connection.refCount--;
        connection.lastUsed = Date.now();
        
        // Close connection if no more references
        if (connection.refCount <= 0) {
          connection.eventSource.close();
          globalConnections.delete(connectionKey);
        }
      }
      
      setIsConnected(false);
      setHasInitial(false);
    };
  }, [instructorId, hasInitial]);

  // Manual cleanup function
  const disconnect = () => {
    if (instructorId) {
      const connectionKey = `driving-test-${instructorId}`;
      const connection = globalConnections.get(connectionKey);
      
      if (connection) {
        connection.eventSource.close();
        globalConnections.delete(connectionKey);
      }
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
