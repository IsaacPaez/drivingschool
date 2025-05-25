import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId, page, timestamp, duration, referrer } = body;
    if (!sessionId || !page) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Intenta actualizar la página existente
    const updateResult = await Session.findOneAndUpdate(
      { sessionId, 'pages.url': page },
      {
        $set: {
          'pages.$.duration': typeof duration === 'number' ? duration : 0,
          'pages.$.referrer': typeof referrer === 'string' ? referrer : '',
          lastActive: timestamp ? new Date(timestamp) : new Date(),
        },
      },
      { new: true }
    );
    if (updateResult) {
      return NextResponse.json({ success: true, updated: true });
    }
    // Si la página no existe, la agregamos
    const addPageResult = await Session.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          pages: {
            url: page,
            referrer: typeof referrer === 'string' ? referrer : '',
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            duration: typeof duration === 'number' ? duration : 0,
            heatmap: [],
          },
        },
        $set: { lastActive: timestamp ? new Date(timestamp) : new Date() },
      },
      { new: true }
    );
    if (addPageResult) {
      return NextResponse.json({ success: true, created: true });
    }
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in track-visit:', error);
    return NextResponse.json({ success: false, error: 'Error in track-visit' }, { status: 500 });
  }
} 