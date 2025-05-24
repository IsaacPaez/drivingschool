import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      userId,
      sessionId,
      pageUrl,
      eventType,
      x,
      y,
      elementId,
      elementClass,
      elementTag,
      timestamp
    } = req.body;

    // Buscar la sesión
    let session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Si la sesión está cerrada, reactivarla
    if (session.sessionActive === false) {
      session.sessionActive = true;
      session.endTimestamp = null;
    }

    // Buscar la página correspondiente en la sesión
    let page = session.pages.find((p) => p.url === pageUrl);
    if (!page) {
      // Si la página no existe, crearla (sin duración ni referrer)
      page = {
        url: pageUrl,
        referrer: '',
        timestamp: new Date(timestamp) || new Date(),
        duration: 0,
        heatmap: []
      };
      session.pages.push(page);
      await session.save(); // Guardar la nueva página antes de hacer el push atómico
    }

    // Usar $push atómico para evitar VersionError
    await Session.findOneAndUpdate(
      { sessionId, "pages.url": pageUrl },
      {
        $push: {
          "pages.$.heatmap": {
            eventType,
            x,
            y,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            elementId,
            elementClass,
            elementTag
          }
        },
        $set: { sessionActive: true, endTimestamp: null }
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking heatmap event:', error);
    res.status(500).json({ success: false, error: 'Error tracking heatmap event' });
  }
} 