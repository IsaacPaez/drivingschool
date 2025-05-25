import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }
    // Reactivar la sesión si estaba cerrada
    if (session.sessionActive === false) {
      session.sessionActive = true;
      session.endTimestamp = null;
    }
    session.lastActive = new Date();
    await session.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in session-ping:', error);
    return NextResponse.json({ success: false, error: 'Error in session-ping' }, { status: 500 });
  }
} 