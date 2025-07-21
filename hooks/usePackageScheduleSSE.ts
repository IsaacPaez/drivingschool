import { useState, useEffect, useRef } from 'react';

interface PackageSchedule {
  _id: string;
  date: string;
  hour: string;
  endHour: string;
  availableSpots: number;
  totalSpots: number;
  status: string;
  instructorInfo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export const usePackageScheduleSSE = () => {
  const [packageSchedules, setPackageSchedules] = useState<PackageSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;
  const retryCount = useRef(0);

  useEffect(() => {
    const connectToSSE = () => {
      try {
        console.log('🔗 Connecting to package schedules SSE...');
        
        // Close existing connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource connection
        eventSourceRef.current = new EventSource('/api/packages-schedule/package-schedules-sse');

        eventSourceRef.current.onopen = () => {
          console.log('✅ Package schedules SSE connection opened');
          setIsConnected(true);
          setError(null);
          retryCount.current = 0;
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📦 Package schedules data received:', data);
            
            if (data.schedules && Array.isArray(data.schedules)) {
              setPackageSchedules(data.schedules);
              setIsLoading(false);
            }
          } catch (parseError) {
            console.error('❌ Error parsing package schedules SSE data:', parseError);
            setError('Error parsing data');
          }
        };

        eventSourceRef.current.onerror = (error) => {
          console.error('❌ Package schedules SSE error:', error);
          setIsConnected(false);
          
          if (retryCount.current < maxRetries) {
            retryCount.current++;
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
            console.log(`🔄 Retrying package schedules SSE connection in ${retryDelay}ms (attempt ${retryCount.current}/${maxRetries})`);
            
            retryTimeoutRef.current = setTimeout(() => {
              connectToSSE();
            }, retryDelay);
          } else {
            console.error('❌ Max retry attempts reached for package schedules SSE');
            setError('Connection failed after maximum retries');
            setIsLoading(false);
          }
        };

      } catch (error) {
        console.error('❌ Error creating package schedules SSE connection:', error);
        setError('Failed to create connection');
        setIsLoading(false);
      }
    };

    connectToSSE();

    return () => {
      console.log('🧹 Cleaning up package schedules SSE connection...');
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    packageSchedules,
    isLoading,
    error,
    isConnected
  };
};

export default usePackageScheduleSSE;
