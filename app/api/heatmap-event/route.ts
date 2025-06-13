import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import sessionCache from '@/lib/sessionCache';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId, page, event, events } = body;
    if (!sessionId || !page || (!event && !events)) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Normalizar a array de eventos
    const eventsArray = Array.isArray(events)
      ? events
      : event
        ? [event]
        : [];
    if (eventsArray.length === 0) {
      return NextResponse.json({ success: false, error: 'No events to process' }, { status: 400 });
    }
    // Primero, intentar actualizar en la caché
    let session = sessionCache.get(sessionId);
    if (session) {
      const pageObj = session.pages.find((p: any) => p.url === page);
      if (pageObj) {
        pageObj.heatmap = [...(pageObj.heatmap || []), ...eventsArray];
        session.lastActive = new Date();
        sessionCache.set(sessionId, session);
        return NextResponse.json({ success: true, cached: true });
      } else {
        // Si la página no existe, la agregamos
        session.pages.push({
          url: page,
          timestamp: new Date(),
          duration: 0,
          heatmap: [...eventsArray],
        });
        session.lastActive = new Date();
        sessionCache.set(sessionId, session);
        return NextResponse.json({ success: true, createdPage: true, cached: true });
      }
    }
    // Si no está en caché, actualizar en la base de datos (compatibilidad)
    const updateResult = await Session.findOneAndUpdate(
      { sessionId, 'pages.url': page },
      { $push: { 'pages.$.heatmap': { $each: eventsArray } }, $set: { lastActive: new Date() } },
      { new: true }
    );
    if (updateResult) {
      return NextResponse.json({ success: true });
    }
    // Si la página no existe, la agregamos con los eventos
    const addPageResult = await Session.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          pages: {
            url: page,
            timestamp: new Date(),
            duration: 0,
            heatmap: [...eventsArray],
          },
        },
        $set: { lastActive: new Date() },
      },
      { new: true }
    );
    if (addPageResult) {
      return NextResponse.json({ success: true, createdPage: true });
    }
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in heatmap-event:', error);
    return NextResponse.json({ success: false, error: 'Error in heatmap-event' }, { status: 500 });
  }
} 