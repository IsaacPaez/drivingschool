import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import sessionCache from '@/lib/sessionCache';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    // Normalizar el campo page para que siempre sea solo el pathname
    let { sessionId, page, timestamp, duration, referrer } = body;
    try {
      page = new URL(page, 'http://dummy').pathname;
    } catch {}
    if (referrer) {
      try {
        referrer = new URL(referrer, 'http://dummy').pathname;
      } catch {}
    }
    if (!sessionId || !page) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Buscar la sesión en caché primero
    let session = sessionCache.get(sessionId);
    if (!session) {
      // Si no está en caché, devolver error (no crear aquí)
      return NextResponse.json({ success: false, error: 'Session not found in cache' }, { status: 404 });
    }
    // Buscar si existe una página con la URL completa (legacy)
    const legacyPageIndex = session.pages.findIndex(p => {
      try {
        return new URL(p.url, 'http://dummy').pathname === page && p.url !== page;
      } catch {
        return false;
      }
    });
    // Buscar si ya existe la página normalizada
    const normalizedPageIndex = session.pages.findIndex(p => p.url === page);
    const legacyPage = legacyPageIndex !== -1 ? session.pages[legacyPageIndex] : null;
    const normalizedPage = normalizedPageIndex !== -1 ? session.pages[normalizedPageIndex] : null;
    if (legacyPage && normalizedPage) {
      normalizedPage.duration += legacyPage.duration;
      normalizedPage.heatmap = [...(normalizedPage.heatmap || []), ...(legacyPage.heatmap || [])];
      normalizedPage.timestamp = new Date(Math.min(
        new Date(normalizedPage.timestamp).getTime(),
        new Date(legacyPage.timestamp).getTime()
      ));
      normalizedPage.referrer = normalizedPage.referrer || legacyPage.referrer;
      session.pages.splice(legacyPageIndex, 1);
      normalizedPage.referrer = typeof referrer === 'string' ? referrer : normalizedPage.referrer;
      normalizedPage.duration = typeof duration === 'number' ? duration : normalizedPage.duration;
      normalizedPage.timestamp = timestamp ? new Date(timestamp) : normalizedPage.timestamp;
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, merged: true, cached: true });
    } else if (legacyPage && !normalizedPage) {
      legacyPage.url = page;
      legacyPage.referrer = typeof referrer === 'string' ? referrer : '';
      legacyPage.duration = typeof duration === 'number' ? duration : 0;
      legacyPage.timestamp = timestamp ? new Date(timestamp) : new Date();
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, updated: true, normalized: true, cached: true });
    } else if (normalizedPage) {
      normalizedPage.referrer = typeof referrer === 'string' ? referrer : '';
      normalizedPage.duration = typeof duration === 'number' ? duration : 0;
      normalizedPage.timestamp = timestamp ? new Date(timestamp) : new Date();
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, updated: true, cached: true });
    }
    session.pages.push({
      url: page,
      referrer: typeof referrer === 'string' ? referrer : '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      duration: typeof duration === 'number' ? duration : 0,
      heatmap: [],
    });
    sessionCache.set(sessionId, session);
    return NextResponse.json({ success: true, created: true, cached: true });
  } catch (error) {
    console.error('Error in track-visit:', error);
    // Si el error es VersionError, devolver un mensaje más claro
    if (error?.name === 'VersionError') {
      return NextResponse.json({ success: false, error: 'Session document not found or version mismatch.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Error in track-visit' }, { status: 500 });
  }
} 