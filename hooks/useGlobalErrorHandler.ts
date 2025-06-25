import { useEffect } from 'react';

export const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore SSE-related errors that are expected
      if (event.message?.includes('Controller is already closed') ||
          event.message?.includes('transformAlgorithm') ||
          event.message?.includes('EventSource')) {
        console.warn('SSE error (expected):', event.message);
        event.preventDefault();
        return;
      }

      // Log other errors but don't crash the app
      console.warn('Global error caught:', event.error);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore SSE-related promise rejections
      if (event.reason?.message?.includes('Controller is already closed') ||
          event.reason?.message?.includes('transformAlgorithm') ||
          event.reason?.message?.includes('EventSource')) {
        console.warn('SSE promise rejection (expected):', event.reason);
        event.preventDefault();
        return;
      }

      // Log other promise rejections but don't crash the app
      console.warn('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    // Add global error handlers
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}; 