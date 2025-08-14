import { NextResponse } from 'next/server';
import FastCache from '@/lib/cache';

export async function GET() {
  const start = performance.now();
  
  const stats = FastCache.getStats();
  const responseTime = performance.now() - start;
  
  return NextResponse.json({
    success: true,
    responseTime: `${responseTime.toFixed(2)}ms`,
    cacheStats: stats,
    performance: {
      queryCache: `${stats.query.hits}/${stats.query.hits + stats.query.misses} hit rate`,
      sessionCache: `${stats.session.hits}/${stats.session.hits + stats.session.misses} hit rate`,
      apiCache: `${stats.api.hits}/${stats.api.hits + stats.api.misses} hit rate`,
    },
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'X-Response-Time': `${responseTime.toFixed(2)}ms`,
      'Cache-Control': 'no-cache'
    }
  });
}

// Clear all caches
export async function DELETE() {
  const start = performance.now();
  
  FastCache.clearAll();
  const responseTime = performance.now() - start;
  
  return NextResponse.json({
    success: true,
    message: 'All caches cleared',
    responseTime: `${responseTime.toFixed(2)}ms`,
    timestamp: new Date().toISOString()
  });
}
