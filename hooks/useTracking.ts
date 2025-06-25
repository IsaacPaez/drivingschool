'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function generateSessionId() {
  return Math.random().toString(36).substring(7);
}

export const useTracking = () => {
  const pathname = usePathname();
  const userId = 'anonymous';
  const startTime = useRef(Date.now());
  const lastPage = useRef<string>(pathname);
  const lastReferrer = useRef<string>('');
  const sessionStarted = useRef(false);
  const lastUserId = useRef<string>(userId);
  const lastEvent = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const THROTTLE_DELAY = 1000; // 1 segundo para mousemove
  let lastEventTime = 0;  let closeTimeout: NodeJS.Timeout | null = null;
  let sessionClosed = false;

  // Buffer de heatmap por página
  const heatmapBuffer: Record<string, any[]> = {};

  // Detectar si la navegación es un reload
  let isReload = false;
  if (typeof window !== 'undefined') {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    isReload = nav?.type === 'reload';
  }

  // Obtener o mantener sessionId según el usuario
  function getOrKeepSessionId() {
    if (typeof window !== 'undefined') {
      const storedUserId = window.sessionStorage.getItem('userId');
      let sessionId = window.sessionStorage.getItem('sessionId');
      if (!sessionId || storedUserId !== userId) {
        sessionId = generateSessionId();
        window.sessionStorage.setItem('sessionId', sessionId);
        window.sessionStorage.setItem('userId', userId);
      }
      return sessionId;
    }
    return generateSessionId();
  }

  let SESSION_ID = getOrKeepSessionId();

  // Tracking profesional de sesión
  // duration: tiempo en la página anterior antes de navegar
  const trackSession = async (endSession = false, referrerOverride?: string) => {
    if (endSession && sessionClosed) return; // No cerrar dos veces
    if (endSession) sessionClosed = true;
    const duration = Date.now() - startTime.current;
    const referrer = (referrerOverride ?? lastReferrer.current) || '';
    const payload = {
      userId: lastUserId.current,
      sessionId: SESSION_ID,
      page: pathname,
      referrer,
      duration,
      endSession,
      timestamp: new Date().toISOString(),
    };
    try {
      if (endSession && navigator.sendBeacon) {
        navigator.sendBeacon('/api/session-track', JSON.stringify(payload));
      } else {
        await fetch('/api/session-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      // Silenciar errores en producción
    }
  };


  const flushHeatmapEvents = (url: string) => {
    if (!url) return;
    if (!heatmapBuffer[url] || heatmapBuffer[url].length === 0) return;
    const eventsToSend = [...heatmapBuffer[url]];
    heatmapBuffer[url] = [];
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([
          JSON.stringify({
            sessionId: SESSION_ID,
            page: url,
            events: eventsToSend,
          }),
        ], { type: 'application/json' });
        navigator.sendBeacon('/api/heatmap-event', blob);
      } else {
        fetch('/api/heatmap-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: SESSION_ID,
            page: url,
            events: eventsToSend,
          }),
          keepalive: true,
        });
      }
    } catch (e) {
      // Silenciar errores
    }
  };

  // Tracking de heatmap: clic, movimiento, scroll
  const trackHeatmapEvent = (
    eventType: 'click' | 'move' | 'scroll',
    x: number,
    y: number,
    element?: Element
  ) => {
    try {
      // Coordenadas absolutas
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const absX = x + scrollX;
      const absY = y + scrollY;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const timestamp = new Date().toISOString();
      // Coordenadas relativas
      const relX = absX / screenWidth;
      const relY = absY / screenHeight;
      // Asegurar que elementClass sea string solo en click
      let elementClass = '';
      if (eventType === 'click' && element) {
        elementClass = typeof element.className === 'string' ? element.className : '';
      }

      const pageKey = pathname || '';
      if (!heatmapBuffer[pageKey]) heatmapBuffer[pageKey] = [];
      heatmapBuffer[pageKey].push({
        eventType,
        x: absX,
        y: absY,
        screenWidth,
        screenHeight,
        devicePixelRatio,
        scrollX,
        scrollY,
        relX,
        relY,
        timestamp,
        elementId: eventType === 'click' && element ? element.id : '',
        elementClass,
        elementTag: eventType === 'click' && element ? element.tagName : '',
      });
    } catch (error) {
      // Silenciar errores en producción
    }
  };

  useEffect(() => {
    // Si el usuario cambia (login/logout), reiniciar la sesión
    if (lastUserId.current !== 'anonymous') {
      window.sessionStorage.removeItem('sessionId');
      window.sessionStorage.removeItem('userId');
      SESSION_ID = getOrKeepSessionId();
      sessionStarted.current = false;
      lastUserId.current = 'anonymous';
      startTime.current = Date.now();
      lastPage.current = pathname;
      lastReferrer.current = '';
      sessionClosed = false;
    }
    // Al cargar la primera vez, crear la sesión
    if (!sessionStarted.current) {
      // Crear la sesión en la base de datos
      fetch('/api/session-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: lastUserId.current,
          sessionId: SESSION_ID,
          page: pathname,
          referrer: document.referrer ? new URL(document.referrer).pathname : '',
          duration: 0,
          endSession: false,
          timestamp: new Date().toISOString(),
        }),
      });
      // Página inicial: no hay referrer, duración 0
      setTimeout(() => {
        fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: lastUserId.current,
            sessionId: SESSION_ID,
            page: pathname,
            referrer: document.referrer ? new URL(document.referrer).pathname : '',
            duration: 0,
            timestamp: new Date().toISOString(),
          }),
        });
      }, 1000); // 1000 ms = 1 segundo
      sessionStarted.current = true;
    } else if (lastPage.current !== pathname) {
      // Al cambiar de página, guardar la anterior con su duración y referrer
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: lastUserId.current,
          sessionId: SESSION_ID,
          page: lastPage.current,
          referrer: lastReferrer.current,
          duration: Date.now() - startTime.current,
          timestamp: new Date().toISOString(),
        }),
      });
      // Nueva página: duración 0, referrer es la anterior
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: lastUserId.current,
          sessionId: SESSION_ID,
          page: pathname,
          referrer: lastPage.current,
          duration: 0,
          timestamp: new Date().toISOString(),
        }),
      });
      startTime.current = Date.now();
      lastReferrer.current = lastPage.current || '';
      lastPage.current = pathname;
    }    // --- SOLO cerrar sesión si realmente se cierra la pestaña ---
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Esperar 1.5 segundos para ver si es un refresco
        closeTimeout = setTimeout(() => {
          if (!isReload) {
            trackSession(true, lastPage.current || '');
            flushHeatmapEvents(lastPage.current || '');
          }
        }, 1500);
      } else if (document.visibilityState === 'visible') {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Respaldo: beforeunload para asegurar cierre de sesión
    const handleBeforeUnload = () => {
      if (!isReload) {
        trackSession(true, lastPage.current || '');
        flushHeatmapEvents(lastPage.current || '');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Eventos de heatmap
    const handleClick = (e: MouseEvent) => {
      trackHeatmapEvent('click', e.clientX, e.clientY, e.target as Element);
    };
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastEventTime > THROTTLE_DELAY &&
        (Math.abs(e.clientX - lastEvent.current.x) > 10 || Math.abs(e.clientY - lastEvent.current.y) > 10)) {
        lastEvent.current = { x: e.clientX, y: e.clientY };
        lastEventTime = now;
        trackHeatmapEvent('move', e.clientX, e.clientY);
      }
    };
    const handleScroll = () => {
      trackHeatmapEvent('scroll', 0, 0);
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    let prevPage = lastPage.current || '';    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (closeTimeout) clearTimeout(closeTimeout);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      // Al desmontar/cambiar de página, enviar eventos de la página anterior
      flushHeatmapEvents(prevPage);
    };
    // eslint-disable-next-line
  }, [pathname, lastUserId.current]);

  // Al final del hook, retorna el sessionId
  return { sessionId: SESSION_ID };
}; 