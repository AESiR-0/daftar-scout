import rateLimit from 'express-rate-limit';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create a rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware function to apply rate limiting
export function rateLimitMiddleware(request: NextRequest) {
  try {
    // Get the IP address from the request
    const ip = request.ip || 'anonymous';
    
    // Apply rate limiting
    return limiter(ip, (err: any) => {
      if (err) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.next();
    });
  } catch (error) {
    console.error('Rate limit error:', error);
    return NextResponse.next();
  }
}

// Export a more specific rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}); 