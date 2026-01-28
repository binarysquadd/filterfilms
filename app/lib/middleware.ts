import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/api/auth'];
  
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('firebase-session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // For protected routes, let the page component handle role checks
  // The middleware just ensures they have a valid session
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};