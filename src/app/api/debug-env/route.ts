import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Debug environment variables
    const envInfo = {
      DATABASE_TYPE: process.env.DATABASE_TYPE,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      hasMONGODB_URI: !!process.env.MONGODB_URI,
      hasSQLITE_PATH: !!process.env.SQLITE_PATH,
      relevantEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('NEXTAUTH') || 
        key.includes('MONGO') ||
        key.includes('SQLITE')
      )
    };
    
    return NextResponse.json({
      success: true,
      environment: envInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
