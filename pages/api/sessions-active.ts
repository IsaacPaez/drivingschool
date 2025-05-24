import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

const INACTIVITY_LIMIT_MS = 30 * 1000; // 30 segundos

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const now = new Date();
    // Buscar sesiones activas que llevan inactivas más de 30s
    const inactiveSessions = await Session.find({
      sessionActive: true,
      lastActive: { $lt: new Date(now.getTime() - INACTIVITY_LIMIT_MS) }
    });
    // Marcar como cerradas
    for (const session of inactiveSessions) {
      session.sessionActive = false;
      session.endTimestamp = session.lastActive;
      await session.save();
    }
    // Retornar solo las sesiones realmente activas
    const activeSessions = await Session.find({ sessionActive: true });
    res.status(200).json({ success: true, data: activeSessions });
  } catch (error) {
    console.error('Error in sessions-active:', error);
    res.status(500).json({ success: false, error: 'Error in sessions-active' });
  }
} 