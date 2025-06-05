import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
const rateLimit = new Map();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
};

// Define which routes should be rate limited
const RATE_LIMITED_ROUTES = [
  '/api/endpoints/me',
  '/api/endpoints/languages',
  '/api/endpoints/feature-request',
  '/api/endpoints/support',
  '/api/scout',
];

export function middleware(request: NextRequest) {
  // Check if the request path matches any of our rate-limited routes
  const isRateLimitedRoute = RATE_LIMITED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isRateLimitedRoute) {
    const ip = request.ip || 'anonymous';
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
    '/api/endpoints/:path*',
    '/api/scout/:path*',
  ],
};
