import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';

export async function GET() {
  try {
    const db = await DatabaseFactory.getAdapter();
    
    // Get all users from database
    const users = await db.findUsers();
    
    return NextResponse.json({
      message: 'Database debug info',
      userCount: users?.length || 0,
      users: users?.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      })) || []
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      error: 'Failed to fetch database info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}