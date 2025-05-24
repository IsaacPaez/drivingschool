import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import { getClientIp } from 'request-ip';
import geoip from 'geoip-lite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    // Soportar navigator.sendBeacon: parsear el body si es string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { sessionId, userId, page, referrer, duration, endSession, timestamp } = body;
    let ip = getClientIp(req);
    // En local, usar una IP pública de ejemplo para pruebas de geolocalización
    // En producción, la IP será la real del usuario
    if (process.env.NODE_ENV !== 'production' && (ip === '::1' || ip === '127.0.0.1')) {
      ip = '8.8.8.8'; // Google DNS, solo para pruebas locales
    }
    const userAgent = req.headers['user-agent'] || '';
    const geo = geoip.lookup(ip || '');

    //console.log('API/session-track received:', body);

    let session = await Session.findOne({ sessionId });

    if (!session) {
      // Crear nueva sesión
      session = await Session.create({
        sessionId,
        userId,
        ipAddress: ip,
        userAgent,
        startTimestamp: timestamp ? new Date(timestamp) : new Date(),
        endTimestamp: null,
        sessionActive: true,
        pages: [{ url: page, referrer, timestamp: timestamp ? new Date(timestamp) : new Date(), duration }],
        geolocation: geo ? {
          country: geo.country,
          city: geo.city,
          latitude: geo.ll[0],
          longitude: geo.ll[1],
          vpn: geo?.org?.toLowerCase().includes('vpn') || false
        } : null
      });
      //console.log('Session created:', session);
    } else {
      // Si la sesión está cerrada, reactivarla
      if (session.sessionActive === false) {
        session.sessionActive = true;
        session.endTimestamp = null;
      }
      // Agregar página visitada
      session.pages.push({ url: page, referrer, timestamp: timestamp ? new Date(timestamp) : new Date(), duration });
      // Solo actualizar endTimestamp y sessionActive si endSession es true
      if (endSession) {
        session.endTimestamp = new Date();
        session.sessionActive = false;
      }
      await session.save();
      //console.log('Session updated:', session);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ success: false, error: 'Error tracking session', details: error.message });
  }
} 