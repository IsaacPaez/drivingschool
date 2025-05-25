import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export async function POST() {
  try {
    await dbConnect();
    const now = new Date();
    const THIRTY_SECONDS = 30 * 1000;
    const sessions = await Session.find({ sessionActive: true });
    let updated = 0;
    for (const session of sessions) {
      if (now.getTime() - new Date(session.lastActive).getTime() > THIRTY_SECONDS) {
        session.sessionActive = false;
        session.endTimestamp = now;
        await session.save();
        updated++;
      }
    }
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error in sessions-active:', error);
    return NextResponse.json({ success: false, error: 'Error in sessions-active' }, { status: 500 });
  }
} 