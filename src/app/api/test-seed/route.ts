import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const db = await DatabaseFactory.getAdapter();

    console.log('🌱 Starting simple database test...');

    // Check if admin user already exists
    let admin = await db.findUserByEmail('admin@farm.com');
    console.log('Admin found:', admin ? 'yes' : 'no');
    
    if (!admin) {
      // Create admin user
      console.log('Creating admin user...');
      const adminPassword = await bcrypt.hash('admin123', 12);
      admin = await db.createUser({
        username: 'admin',
        email: 'admin@farm.com',
        password: adminPassword,
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1234567890'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user created successfully');
    }

    return NextResponse.json({
      success: true,
      message: 'Simple test completed successfully!',
      admin: admin.email
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to run test',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
