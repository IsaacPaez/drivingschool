import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import sessionCache from '@/lib/sessionCache';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }
    const session = sessionCache.get(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found in cache' }, { status: 404 });
    }
    // Guardar o actualizar en la base de datos
    await Session.findOneAndUpdate(
      { sessionId },
      session,
      { upsert: true, new: true }
    );
    sessionCache.delete(sessionId);
    return NextResponse.json({ success: true, flushed: true });
  } catch (error) {
    console.error('Error in session-flush:', error);
    return NextResponse.json({ success: false, error: 'Error in session-flush' }, { status: 500 });
  }
} 