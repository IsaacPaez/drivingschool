'use client';
import { useTracking } from '@/hooks/useTracking';
 
export default function TrackingProvider() {
  useTracking();
  return null;
} 