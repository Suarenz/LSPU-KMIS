import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwtService from '@/lib/services/jwt-service';

export async function middleware(request: NextRequest) {
  // Check if this is an API route that requires authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // For API routes, we need to validate the token without using Prisma in middleware
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    
    if (isApiRoute && request.method !== 'OPTIONS') {
      // For protected API routes, validate the token without database lookup in middleware
      // Allow public API routes to pass through (e.g., /api/auth/login, /api/auth/signup)
      const isPublicRoute = request.nextUrl.pathname.startsWith('/api/auth/login') ||
                           request.nextUrl.pathname.startsWith('/api/auth/signup') ||
                           request.nextUrl.pathname.startsWith('/api/auth/refresh') ||
                           request.nextUrl.pathname.startsWith('/api/auth/me') ||
                           request.nextUrl.pathname.startsWith('/api/auth/logout');
                           
      if (!isPublicRoute) {
        // Extract the token from the Authorization header
        const authHeader = request.headers.get('authorization');
        let token = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        } else {
          // Try to get token from cookies
          const cookies = request.cookies;
          token = cookies.get('access_token')?.value;
        }

        if (!token) {
          // For API routes, return a 401 response instead of redirecting
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Verify the JWT token (this doesn't require database access)
        const decoded = await jwtService.verifyToken(token);
        if (!decoded) {
          return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
      }
    }
  } else {
    // For non-API routes (pages), we can use the auth context on the client side
    // Just allow them to proceed and let the client-side auth handle it
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};