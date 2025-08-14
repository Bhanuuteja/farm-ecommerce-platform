import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Debug environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    return NextResponse.json({
      success: true,
      debug: {
        hasMongoUri: !!mongoUri,
        mongoUriLength: mongoUri?.length || 0,
        mongoUriPrefix: mongoUri?.substring(0, 20) + '...',
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('MONGO'))
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
