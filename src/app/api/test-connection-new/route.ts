import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';

// Cache connection status for 30 seconds
let connectionCache: { status: boolean; timestamp: number; dbType: string } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export async function GET(request: NextRequest) {
  try {
    const dbType = process.env.DATABASE_TYPE || 'mongodb';
    
    // Return cached result if valid and same database type
    if (connectionCache && 
        Date.now() - connectionCache.timestamp < CACHE_DURATION &&
        connectionCache.dbType === dbType) {
      return NextResponse.json({ 
        success: connectionCache.status,
        message: connectionCache.status ? `Connected to ${dbType.toUpperCase()} (cached)` : 'Not connected (cached)',
        timestamp: new Date().toISOString(),
        database: dbType,
        cached: true
      });
    }

    // Quick connection test with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
    );
    
    const connectPromise = DatabaseFactory.getAdapter();
    const db = await Promise.race([connectPromise, timeoutPromise]) as any;
    
    // Test a simple operation (this will fail gracefully if user doesn't exist)
    try {
      await db.findUserById('connection-test');
    } catch (e) {
      // Expected to fail for non-existent user, but connection is working
      console.log('Connection test query completed (user not found is expected)');
    }
    
    // Cache successful connection
    connectionCache = { status: true, timestamp: Date.now(), dbType };
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully connected to ${dbType.toUpperCase()}!`,
      timestamp: new Date().toISOString(),
      database: dbType,
      cached: false
    });

  } catch (error: any) {
    console.error('Database connection error:', error);
    
    const dbType = process.env.DATABASE_TYPE || 'mongodb';
    
    // Cache failed connection
    connectionCache = { status: false, timestamp: Date.now(), dbType };
    
    let specificHelp = {};
    
    if (dbType === 'sqlite') {
      specificHelp = {
        step1: 'Check if the SQLite path is accessible',
        step2: 'Ensure the directory exists and has write permissions',
        step3: 'Verify sqlite3 package is installed: npm install sqlite3'
      };
    } else if (dbType === 'mongodb') {
      specificHelp = {
        step1: 'Check MONGODB_URI in .env.local',
        step2: 'Verify MongoDB Atlas IP whitelist includes your IP',
        step3: 'Ensure database user credentials are correct',
        step4: 'Try using 0.0.0.0/0 for development (allows all IPs)'
      };
    } else if (dbType === 'postgresql') {
      specificHelp = {
        step1: 'Check POSTGRES_URL in .env.local',
        step2: 'Verify PostgreSQL/Supabase credentials',
        step3: 'Ensure pg package is installed: npm install pg @types/pg'
      };
    } else {
      specificHelp = {
        step1: `Check your ${dbType.toUpperCase()} connection string in .env.local`,
        step2: `Verify ${dbType} database packages are installed`,
        step3: 'Restart the development server after changes'
      };
    }
    
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Database connection failed',
      timestamp: new Date().toISOString(),
      database: dbType,
      help: specificHelp
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
