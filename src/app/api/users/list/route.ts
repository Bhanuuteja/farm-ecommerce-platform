import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { auth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    const users = await db.findUsers();
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
