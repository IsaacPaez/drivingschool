import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import UserVisit from '@/models/UserVisit';
import { getClientIp } from 'request-ip';
import geoip from 'geoip-lite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    let ip = getClientIp(req);
    // En local, usar una IP pública de ejemplo para pruebas de geolocalización
    // En producción, la IP será la real del usuario
    if (process.env.NODE_ENV !== 'production' && (ip === '::1' || ip === '127.0.0.1')) {
      ip = '8.8.8.8'; // Google DNS, solo para pruebas locales
    }
    const geo = geoip.lookup(ip || '');
    
    const visitData = {
      userId: req.body.userId || 'anonymous',
      sessionId: req.body.sessionId,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      pageUrl: req.body.pageUrl,
      referrer: req.headers.referer,
      duration: req.body.duration || 0,
      geolocation: geo ? {
        country: geo.country,
        city: geo.city,
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      } : null
    };

    const visit = await UserVisit.create(visitData);
    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, error: 'Error tracking visit' });
  }
} 