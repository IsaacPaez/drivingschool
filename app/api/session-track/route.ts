import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  // Next.js 13+ no expone req.ip, así que solo x-forwarded-for
  return '';
}

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
    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || '';
    
    // Use provided geolocation or default values
    const geo = geolocation || {
      country: '',
      city: '',
      latitude: null,
      longitude: null,
      vpn: false,
    };

    if (!session) {
      session = new Session({
        sessionId,
        userId,
        geolocation: geo,
        ipAddress,
        userAgent,
        startTimestamp: timestamp ? new Date(timestamp) : new Date(),
        sessionActive: true,
        lastActive: timestamp ? new Date(timestamp) : new Date(),
        pages: [pageObj],
      });
      await session.save();
      return NextResponse.json({ success: true, created: true });
    }
    // If the page is not in the array, add it
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