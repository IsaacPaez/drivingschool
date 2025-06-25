import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/Session';
import sessionCache from '@/lib/sessionCache';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate required fields
    let { sessionId, page, timestamp, duration, referrer } = body;
    
    if (!sessionId || !page) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: sessionId and page are required' 
      }, { status: 400 });
    }

    // Normalize page URL safely
    try {
      page = new URL(page, 'http://dummy').pathname;
    } catch (urlError) {
      console.warn('Invalid page URL format:', page);
      page = String(page).startsWith('/') ? String(page) : `/${String(page)}`;
    }

    // Normalize referrer URL safely
    if (referrer) {
      try {
        referrer = new URL(referrer, 'http://dummy').pathname;
      } catch (urlError) {
        console.warn('Invalid referrer URL format:', referrer);
        referrer = String(referrer).startsWith('/') ? String(referrer) : `/${String(referrer)}`;
      }
    }

    // Get session from cache
    let session = sessionCache.get(sessionId);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session not found in cache' 
      }, { status: 404 });
    }

    // Validate session structure
    if (!session.pages || !Array.isArray(session.pages)) {
      session.pages = [];
    }

    // Find existing pages safely
    const legacyPageIndex = session.pages.findIndex(p => {
      if (!p || !p.url) return false;
      try {
        return new URL(p.url, 'http://dummy').pathname === page && p.url !== page;
      } catch {
        return false;
      }
    });

    const normalizedPageIndex = session.pages.findIndex(p => p && p.url === page);
    
    const legacyPage = legacyPageIndex !== -1 ? session.pages[legacyPageIndex] : null;
    const normalizedPage = normalizedPageIndex !== -1 ? session.pages[normalizedPageIndex] : null;

    // Handle page updates
    if (legacyPage && normalizedPage) {
      // Merge legacy and normalized pages
      normalizedPage.duration += legacyPage.duration || 0;
      normalizedPage.heatmap = [
        ...(normalizedPage.heatmap || []), 
        ...(legacyPage.heatmap || [])
      ];
      normalizedPage.timestamp = new Date(Math.min(
        new Date(normalizedPage.timestamp || Date.now()).getTime(),
        new Date(legacyPage.timestamp || Date.now()).getTime()
      ));
      normalizedPage.referrer = normalizedPage.referrer || legacyPage.referrer;
      session.pages.splice(legacyPageIndex, 1);
      
      // Update with new data
      normalizedPage.referrer = typeof referrer === 'string' ? referrer : normalizedPage.referrer;
      normalizedPage.duration = typeof duration === 'number' ? duration : normalizedPage.duration;
      normalizedPage.timestamp = timestamp ? new Date(timestamp) : normalizedPage.timestamp;
      
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, merged: true, cached: true });
      
    } else if (legacyPage && !normalizedPage) {
      // Convert legacy page to normalized
      legacyPage.url = page;
      legacyPage.referrer = typeof referrer === 'string' ? referrer : '';
      legacyPage.duration = typeof duration === 'number' ? duration : 0;
      legacyPage.timestamp = timestamp ? new Date(timestamp) : new Date();
      
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, updated: true, normalized: true, cached: true });
      
    } else if (normalizedPage) {
      // Update existing normalized page
      normalizedPage.referrer = typeof referrer === 'string' ? referrer : '';
      normalizedPage.duration = typeof duration === 'number' ? duration : 0;
      normalizedPage.timestamp = timestamp ? new Date(timestamp) : new Date();
      
      sessionCache.set(sessionId, session);
      return NextResponse.json({ success: true, updated: true, cached: true });
    }

    // Create new page entry
    session.pages.push({
      url: page,
      referrer: typeof referrer === 'string' ? referrer : '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      duration: typeof duration === 'number' ? duration : 0,
      heatmap: [],
    });
    
    sessionCache.set(sessionId, session);
    return NextResponse.json({ success: true, created: true, cached: true });
    
  } catch (error) {
    console.error('Error in track-visit:', error);
    
    // Handle specific MongoDB errors
    if (error?.name === 'VersionError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Session document not found or version mismatch.' 
      }, { status: 409 });
    }
    
    if (error?.name === 'ValidationError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation error in track-visit data.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error in track-visit' 
    }, { status: 500 });
  }
} 