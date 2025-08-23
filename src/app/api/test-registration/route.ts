import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    const db = await DatabaseFactory.getAdapter();
    console.log('Database adapter created successfully');
    
    // Test a simple query
    const users = await db.findUsers();
    console.log('Found users:', users?.length || 0);
    
    return NextResponse.json({
      status: 'Database connection working',
      userCount: users?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const testUser = {
      username: 'test_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'testpass123',
      role: 'customer'
    };

    // Simulate the registration process
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const result = await response.text();
    
    return NextResponse.json({
      testUser: { ...testUser, password: '[HIDDEN]' },
      registrationResponse: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        body: result
      }
    });
  } catch (error) {
    console.error('Registration test error:', error);
    return NextResponse.json({
      error: 'Registration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
