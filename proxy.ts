import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Admin paneli kontrolü
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('next-auth.session-token');
    
    // Cookie yoksa signin'e yönlendir
    if (!sessionToken) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
