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
  const bcRef = useRef<BroadcastChannel | null>(null);
  const backoffRef = useRef<number>(1000); // ms, capped
  const lockRenewalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabIdRef = useRef<string>(`${Date.now()}_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!instructorId) {
      setSchedule([]);
      setError(null);
      setIsConnected(false);
      setHasInitial(false);
      return;
    }

    // Close existing channel/connection
    if (eventSourceRef.current) eventSourceRef.current.close();
    if (bcRef.current) bcRef.current.close();
    if (lockRenewalRef.current) { clearInterval(lockRenewalRef.current); lockRenewalRef.current = null; }
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }

    setHasInitial(false);
    backoffRef.current = 1000;

    // Channel per instructor
    const channelName = `sse-schedule-${instructorId}`;
    const bc = new BroadcastChannel(channelName);
    bcRef.current = bc;

    const lockKey = `sse_lock_${instructorId}`;
    const acquireLock = (): boolean => {
      const now = Date.now();
      const current = localStorage.getItem(lockKey);
      if (current) {
        try {
          const parsed = JSON.parse(current) as { tabId: string; expiresAt: number };
          if (parsed.expiresAt > now && parsed.tabId !== tabIdRef.current) return false;
        } catch { /* ignore */ }
      }
      localStorage.setItem(lockKey, JSON.stringify({ tabId: tabIdRef.current, expiresAt: now + 15000 }));
      return true;
    };
    const renewLock = () => {
      const current = localStorage.getItem(lockKey);
      if (!current) return;
      try {
        const parsed = JSON.parse(current) as { tabId: string; expiresAt: number };
        if (parsed.tabId === tabIdRef.current) {
          parsed.expiresAt = Date.now() + 15000;
          localStorage.setItem(lockKey, JSON.stringify(parsed));
        }
      } catch { /* ignore */ }
    };
    const releaseLock = () => {
      const current = localStorage.getItem(lockKey);
      if (!current) return;
      try {
        const parsed = JSON.parse(current) as { tabId: string };
        if (parsed.tabId === tabIdRef.current) localStorage.removeItem(lockKey);
      } catch { /* ignore */ }
    };

    // Followers listen to leader via BroadcastChannel
    bc.onmessage = (evt) => {
      const data = evt.data as { type: string; payload?: unknown };
      if (data?.type === 'schedule') {
        const payload = data.payload as { schedule?: unknown[] };
        if (payload?.schedule) setSchedule(payload.schedule);
        if (!hasInitial) setHasInitial(true);
        setIsConnected(true);
        setError(null);
      } else if (data?.type === 'error') {
        setError('Connection issue. Reconnecting...');
      }
    };

    const openEventSource = () => {
      const isLeader = acquireLock();
      if (!isLeader) {
        setIsConnected(true);
        return;
      }

      lockRenewalRef.current = setInterval(renewLock, 5000);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const es = new EventSource(`${baseUrl}/api/driving-lessons/schedule-updates?id=${instructorId}`);
      eventSourceRef.current = es;

      heartbeatRef.current = setInterval(() => {
        bc.postMessage({ type: 'heartbeat' });
      }, 5000);

      es.onopen = () => {
        setIsConnected(true);
        setError(null);
        backoffRef.current = 1000;
      };
      es.onmessage = (event) => {
        try {
          const data: ScheduleData = JSON.parse(event.data);
          if (data.type === 'initial' || data.type === 'update') {
            if (data.schedule) {
              setSchedule(data.schedule);
              bc.postMessage({ type: 'schedule', payload: { schedule: data.schedule } });
            }
            if (!hasInitial) setHasInitial(true);
          } else if (data.type === 'error') {
            setError(data.message || 'Unknown error occurred');
            bc.postMessage({ type: 'error' });
          }
        } catch {
          setError('Failed to parse server data');
        }
      };
      es.onerror = () => {
        setIsConnected(false);
        setError('Connection issue. Reconnecting...');
        // If connection is closed, release lock and retry with backoff
        const state = (eventSourceRef.current as any)?.readyState;
        if (state === 2) { // CLOSED
          releaseLock();
          if (lockRenewalRef.current) { clearInterval(lockRenewalRef.current); lockRenewalRef.current = null; }
          if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
          const delay = Math.min(backoffRef.current, 30000);
          setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, 30000);
            openEventSource();
          }, delay);
        }
      };
    };

    openEventSource();
    const beforeUnload = () => releaseLock();
    window.addEventListener('beforeunload', beforeUnload);

    // Cleanup function
    return () => {
      if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null; }
      if (bcRef.current) { bcRef.current.close(); bcRef.current = null; }
      if (lockRenewalRef.current) { clearInterval(lockRenewalRef.current); lockRenewalRef.current = null; }
      if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
      window.removeEventListener('beforeunload', beforeUnload);
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