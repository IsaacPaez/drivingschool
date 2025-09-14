import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

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
  students: unknown[];
  userHasPendingRequest?: boolean;
  userIsEnrolled?: boolean;
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

interface TicketClassData {
  type: 'initial' | 'update' | 'error';
  ticketClasses?: TicketClass[];
  message?: string;
}

export default function useRegisterOnlineWebSocket(
  instructorId: string | null, 
  classId: string | null = null, 
  userId: string | null = null
) {
  const [ticketClasses, setTicketClasses] = useState<TicketClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Create WebSocket URL
  const createWsUrl = useCallback(() => {
    if (classId) {
      // For classId filtering
      let url = `${process.env.NODE_ENV === 'production' ? 'wss:' : 'ws:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/ws/ticket-classes-updates?classId=${classId}`;
      if (instructorId && instructorId !== "ALL") {
        url += `&instructorId=${instructorId}`;
      }
      if (userId) {
        url += `&userId=${userId}`;
      }
      return url;
    } else if (instructorId && instructorId !== "ALL") {
      // For instructor filtering
      let url = `${process.env.NODE_ENV === 'production' ? 'wss:' : 'ws:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/ws/ticket-classes-updates?instructorId=${instructorId}&type=ALL`;
      if (userId) {
        url += `&userId=${userId}`;
      }
      return url;
    }
    return '';
  }, [instructorId, classId, userId]);

  const wsUrl = createWsUrl();
  const shouldConnect = !!wsUrl && (!!classId || (!!instructorId && instructorId !== "ALL"));

  const {
    data,
    error: wsError,
    isConnected: wsConnected,
    isConnecting,
    sendMessage,
    disconnect
  } = useWebSocket<TicketClassData>({
    url: wsUrl,
    shouldConnect,
    reconnectAttempts: 5,
    reconnectInterval: 2000
  });

  // Handle WebSocket data updates
  useEffect(() => {
    if (data) {
      console.log('📡 Ticket Classes WebSocket data received:', data.type);
      
      if (data.type === 'initial' || data.type === 'update') {
        if (data.ticketClasses) {
          setTicketClasses(data.ticketClasses);
          setIsLoading(false);
          setError(null);
        }
      } else if (data.type === 'error') {
        console.log('❌ Ticket Classes WebSocket Error:', data.message);
        setError(data.message || 'Unknown error occurred');
        setIsLoading(false);
      }
    }
  }, [data]);

  // Handle WebSocket connection state
  useEffect(() => {
    setIsConnected(wsConnected);
    
    if (wsConnected) {
      setError(null);
    }
  }, [wsConnected]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      setError(wsError);
      setIsLoading(false);
    }
  }, [wsError]);

  // Handle loading state based on connection
  useEffect(() => {
    if (shouldConnect && !wsConnected && !isConnecting) {
      setIsLoading(true);
    } else if (!shouldConnect) {
      setTicketClasses([]);
      setError(null);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [shouldConnect, wsConnected, isConnecting]);

  // Request fresh data when connected
  const requestUpdate = useCallback(() => {
    if (isConnected) {
      sendMessage({
        type: 'request_update',
        instructorId,
        classId,
        userId
      });
    }
  }, [isConnected, instructorId, classId, userId, sendMessage]);

  return {
    ticketClasses,
    isLoading,
    error,
    isConnected,
    isConnecting,
    disconnect,
    requestUpdate
  };
}
