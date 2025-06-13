'use client';
import { useTracking } from '@/hooks/useTracking';
import useSessionFlush from '@/hooks/useSessionFlush';

export default function TrackingProvider() {
  const { sessionId } = useTracking();
  useSessionFlush(sessionId);
  return null;
} 