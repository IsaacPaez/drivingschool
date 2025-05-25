import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId, page, event } = body;
    if (!sessionId || !page || !event) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Intenta hacer push al heatmap de la página correspondiente
    const updateResult = await Session.findOneAndUpdate(
      { sessionId, 'pages.url': page },
      { $push: { 'pages.$.heatmap': event }, $set: { lastActive: new Date() } },
      { new: true }
    );
    if (updateResult) {
      return NextResponse.json({ success: true });
    }
    // Si la página no existe, la agregamos con el evento
    const addPageResult = await Session.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          pages: {
            url: page,
            timestamp: new Date(),
            duration: 0,
            heatmap: [event],
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