import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId, userId, geolocation, page, timestamp } = body;
    if (!sessionId || !userId || !page) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    let session = await Session.findOne({ sessionId });
    const pageObj = {
      url: page,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      duration: 0,
      heatmap: [],
    };
    if (!session) {
      session = new Session({
        sessionId,
        userId,
        geolocation,
        startTimestamp: timestamp ? new Date(timestamp) : new Date(),
        sessionActive: true,
        lastActive: timestamp ? new Date(timestamp) : new Date(),
        pages: [pageObj],
      });
      await session.save();
      return NextResponse.json({ success: true, created: true });
    }
    // Si la página no está en el array, la agregamos
    if (!session.pages.some((p: any) => p.url === page)) {
      session.pages.push(pageObj);
    }
    session.lastActive = timestamp ? new Date(timestamp) : new Date();
    session.sessionActive = true;
    await session.save();
    return NextResponse.json({ success: true, created: false });
  } catch (error) {
    console.error('Error in session-track:', error);
    return NextResponse.json({ success: false, error: 'Error in session-track' }, { status: 500 });
  }
} 