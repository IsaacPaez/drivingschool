import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    // Reactivar la sesión si estaba cerrada
    if (session.sessionActive === false) {
      session.sessionActive = true;
      session.endTimestamp = null;
    }
    session.lastActive = new Date();
    await session.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in session-ping:', error);
    res.status(500).json({ success: false, error: 'Error in session-ping' });
  }
} 