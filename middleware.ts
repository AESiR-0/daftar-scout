import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
const rateLimit = new Map();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 40, // Limit each IP to 100 requests per windowMs
};

// Define which routes should be rate limited
const RATE_LIMITED_ROUTES = [
  '/api/endpoints/me',
  '/api/endpoints/languages',
  '/api/endpoints/feature-request',
  '/api/endpoints/support',
  '/api/scout',
];

export async function middleware(request: NextRequest) {
  // REDIRECT LOGGED-IN USERS FROM /landing OR /login TO /[role]
  const isLandingOrLogin =
    request.nextUrl.pathname === '/landing' ||
    request.nextUrl.pathname === '/login';

  if (isLandingOrLogin) {
    try {
      const cookie = request.headers.get('cookie') || '';
      const res = await fetch(`${request.nextUrl.origin}/api/endpoints/me`, {
        headers: { cookie },
      });
      if (res.ok) {
        const user = await res.json();
        if (user && user.role) {
          // Redirect to /[role] (e.g., /founder, /investor, etc.)
          return NextResponse.redirect(`${request.nextUrl.origin}/${user.role}`);
        }
      }
    } catch (err) {
      // Ignore errors, just proceed
    }
  }

  // FIRST PRIORITY: Check for deactivated users on all app pages
  const isAppPage =
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/static') &&
    !request.nextUrl.pathname.startsWith('/account-deactivated') &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/sign-up') &&
    !request.nextUrl.pathname.startsWith('/signin') &&
    !request.nextUrl.pathname.startsWith('/signout');

  if (isAppPage) {
    try {
      const cookie = request.headers.get('cookie') || '';
      const res = await fetch(`${request.nextUrl.origin}/api/endpoints/me`, {
        headers: { cookie },
      });
      
      if (res.ok) {
        const user = await res.json();
        console.log('Middleware checking user:', user?.email, 'isArchived:', user?.isArchived, 'isActive:', user?.isActive);
        
        if (user && (user.isArchived === true || user.isActive === false)) {
          console.log('Redirecting deactivated user to account-deactivated page');
          return NextResponse.redirect(`${request.nextUrl.origin}/account-deactivated`);
        }
      } else {
        console.log('API call failed, status:', res.status);
      }
    } catch (err) {
      console.error('Middleware error:', err);
      // Don't redirect on error, just log it
    }
  }

  // SECOND PRIORITY: Rate limiting for API routes
  const isRateLimitedRoute = RATE_LIMITED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isRateLimitedRoute) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimit.entries()) {
      if (value.timestamp < windowStart) {
        rateLimit.delete(key);
      }
    }

    // Get or create rate limit entry for this IP
    const rateLimitInfo = rateLimit.get(ip) || { count: 0, timestamp: now };
    
    // Check if rate limit is exceeded
    if (rateLimitInfo.count >= RATE_LIMIT.max) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests, please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900', // 15 minutes in seconds
          },
        }
      );
    }

    // Update rate limit info
    rateLimit.set(ip, {
      count: rateLimitInfo.count + 1,
      timestamp: now,
    });

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.max.toString());
    response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT.max - rateLimitInfo.count - 1).toString());
    response.headers.set('X-RateLimit-Reset', (Math.floor(now / 1000) + RATE_LIMIT.windowMs / 1000).toString());
    
    return response;
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
