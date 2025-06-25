import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle SSE routes specially
  if (request.nextUrl.pathname.startsWith('/api/cart/updates')) {
    try {
      // Add CORS headers for SSE
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'no-cache')
      response.headers.set('Connection', 'keep-alive')
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Headers', 'Cache-Control')
      return response
    } catch (error) {
      console.warn('SSE middleware error:', error)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/cart/updates/:path*',
    '/api/teachers/classes-updates/:path*',
    '/api/book-now/schedule-updates/:path*'
  ]
}
