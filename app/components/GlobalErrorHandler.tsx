"use client";

import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';

const GlobalErrorHandler = () => {
  useGlobalErrorHandler();
  return null; // This component doesn't render anything
};

export default GlobalErrorHandler; 