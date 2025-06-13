import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import sessionCache from '@/lib/sessionCache';

const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

async function getGeoData(ip: string) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    if (!res.ok) return null;
    const data = await res.json();
    //console.log('IPINFO DATA:', data); // Log para depuración
    return {
      country: data.country || "",
      city: data.city || "",
      region: data.region || "",
      latitude: data.loc ? data.loc.split(',')[0] : null,
      longitude: data.loc ? data.loc.split(',')[1] : null,
      vpn: data.privacy ? !!data.privacy.vpn : false,
      raw: data // Guardar toda la respuesta para depuración
    };
  } catch (e) {
    console.error('Error fetching ipinfo:', e);
    return null;
  }
}

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
    // Buscar la sesión en caché primero
    let session = sessionCache.get(sessionId);
    const pageObj = {
      url: page,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      duration: 0,
      heatmap: [],
    };
    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || '';
    
    let geo = geolocation;
    if (!geo && ipAddress) {
      geo = await getGeoData(ipAddress);
      if (!geo) {
        geo = { country: "", city: "", region: "", latitude: null, longitude: null, vpn: false, raw: null };
      }
    }
    // Log para depuración
    //console.log('GEO TO SAVE:', geo);

    if (!session) {
      // Buscar en la base de datos por si es la primera vez
      let dbSession = await Session.findOne({ sessionId });
      if (!dbSession) {
        dbSession = new Session({
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
        await dbSession.save();
      }
      // Guardar en caché
      session = dbSession.toObject ? dbSession.toObject() : dbSession;
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, created: true, db: true, cached: true });
    }
    // If the page is not in the array, add it
    if (!session.pages.some((p: any) => p.url === page)) {
      session.pages.push(pageObj);
    }
    session.lastActive = timestamp ? new Date(timestamp) : new Date();
    session.sessionActive = true;
    // Actualizamos siempre la geolocalización para reflejar el valor correcto de vpn
    session.geolocation = geo;
    sessionCache.set(sessionId, session);
    return NextResponse.json({ success: true, created: false, cached: true });
  } catch (error) {
    console.error('Error in session-track:', error);
    return NextResponse.json({ success: false, error: 'Error in session-track' }, { status: 500 });
  }
} 