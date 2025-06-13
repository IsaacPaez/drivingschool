import { useEffect } from 'react';

function useSessionFlush(sessionId: string | undefined) {
  useEffect(() => {
    if (!sessionId) return;

    const flushSession = () => {
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ sessionId })], { type: 'application/json' });
          navigator.sendBeacon('/api/session-flush', blob);
        } else {
          // Fallback para navegadores viejos
          fetch('/api/session-flush', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
            keepalive: true,
          });
        }
      } catch (e) {
        // Silenciar errores
      }
    };

    window.addEventListener('beforeunload', flushSession);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushSession();
    });

    return () => {
      window.removeEventListener('beforeunload', flushSession);
      document.removeEventListener('visibilitychange', flushSession);
    };
  }, [sessionId]);
}

export default useSessionFlush; 