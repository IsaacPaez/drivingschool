import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketHookOptions {
  url: string;
  protocols?: string | string[];
  shouldConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketMessage {
  type: string;
  data?: unknown;
  error?: string;
}

export function useWebSocket<T = unknown>(options: WebSocketHookOptions) {
  const {
    url,
    protocols,
    shouldConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!shouldConnect || !mountedRef.current) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔗 WebSocket already connected');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('🔗 Connecting to WebSocket:', url);
      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('✅ WebSocket connected:', url);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message.type);
          
          if (message.type === 'error') {
            setError(message.error || 'WebSocket error');
          } else if (message.data !== undefined) {
            setData(message.data as T);
          }
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
          setError('Failed to parse message');
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Only attempt reconnection if it wasn't a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          const delay = reconnectInterval * Math.pow(1.5, reconnectCountRef.current);
          reconnectCountRef.current++;
          
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, delay);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          setError('Connection failed after multiple attempts');
        }
      };

      ws.onerror = (event) => {
        if (!mountedRef.current) return;
        console.error('❌ WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnecting(false);
      };

    } catch (err) {
      console.error('❌ Failed to create WebSocket:', err);
      setError('Failed to create connection');
      setIsConnecting(false);
    }
  }, [url, protocols, shouldConnect, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageStr);
        console.log('📤 WebSocket message sent:', messageStr);
      } catch (err) {
        console.error('❌ Error sending WebSocket message:', err);
        setError('Failed to send message');
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      setError('WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    if (shouldConnect) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect, shouldConnect]);

  return {
    data,
    error,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
  };
}
