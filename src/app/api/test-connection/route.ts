import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Redirect to the new test-db-connection endpoint
    const url = new URL('/api/test-db-connection', request.url);
    
    return NextResponse.json({ 
      success: true,
      message: 'Please use /api/test-db-connection instead',
      redirect: url.toString(),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Redirect error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Please use /api/test-db-connection instead',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 302 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
