import { useEffect, useRef, useState } from 'react';

interface ScheduleData {
  type: 'initial' | 'update' | 'error';
  schedule?: unknown[];
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

export function useScheduleSSE(instructorId: string | null) {
  const [schedule, setSchedule] = useState<unknown[]>([]);
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
      const eventSource = new EventSource(`${baseUrl}/api/driving-test/schedule-updates?id=${instructorId}`);
      
      connection = {
        eventSource,
        refCount: 0,
        lastUsed: Date.now()
      };
      
      globalConnections.set(connectionKey, connection);
      
      eventSource.onopen = () => {
        if (mountedRef.current) {
          setIsConnected(true);
          setError(null);
        }
      };
      
      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const data: ScheduleData = JSON.parse(event.data);
          if (data.type === 'initial' || data.type === 'update') {
            if (data.schedule) {
              setSchedule(data.schedule);
            }
            if (!hasInitial) setHasInitial(true);
          } else if (data.type === 'error') {
            setError(data.message || 'Unknown error occurred');
          }
        } catch {
          // Silently handle parse errors
        }
      };
      
      eventSource.onerror = () => {
        if (mountedRef.current) {
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