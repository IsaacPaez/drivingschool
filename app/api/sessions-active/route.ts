import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import sessionCache from '@/lib/sessionCache';

export async function POST() {
  try {
    await dbConnect();
    const now = new Date();
    const THIRTY_SECONDS = 30 * 1000;
    let updated = 0;
    for (const [sessionId, session] of sessionCache.entries()) {
      if (session.sessionActive && now.getTime() - new Date(session.lastActive).getTime() > THIRTY_SECONDS) {
        session.sessionActive = false;
        session.endTimestamp = now;
        sessionCache.set(sessionId, session);
        updated++;
      }
    }
    return NextResponse.json({ success: true, updated, cached: true });
  } catch (error) {
    console.error('Error in sessions-active:', error);
    return NextResponse.json({ success: false, error: 'Error in sessions-active' }, { status: 500 });
  }
} 