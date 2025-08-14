import { NextResponse } from 'next/server';
import FastCache from '@/lib/cache';

// Ultra-fast API route with aggressive caching
export async function GET() {
  const start = performance.now();
  
  // Check cache first (should be < 1ms)
  const cacheKey = 'fast-test-response';
  const cached = FastCache.getCachedResponse(cacheKey);
  
  if (cached) {
    const responseTime = performance.now() - start;
    return NextResponse.json({
      ...cached,
      cached: true,
      responseTime: `${responseTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'X-Cache': 'HIT',
        'X-Response-Time': `${responseTime.toFixed(2)}ms`,
        'Cache-Control': 'public, max-age=30',
      },
    });
  }
  
  // Generate fresh response (cache miss)
  const response = {
    success: true,
    message: 'Ultra-fast response with caching',
    server: 'Next.js 15.4.5 (Turbopack)',
    optimizations: [
      'In-memory caching',
      'Aggressive timeouts',
      'Connection pooling',
      'Non-blocking operations'
    ],
    cached: false,
  };
  
  // Cache for 30 seconds
  FastCache.cacheResponse(cacheKey, response, 30);
  
  const responseTime = performance.now() - start;
  
  return NextResponse.json({
    ...response,
    responseTime: `${responseTime.toFixed(2)}ms`,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'X-Cache': 'MISS',
      'X-Response-Time': `${responseTime.toFixed(2)}ms`,
      'Cache-Control': 'public, max-age=30',
    },
  });
}
