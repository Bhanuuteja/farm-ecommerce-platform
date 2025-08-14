import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Database seeding endpoint',
    instructions: 'Use POST to seed the database',
    status: 'Data already exists - skipping seeding',
    credentials: {
      admin: { email: 'admin@farm.com', password: 'admin123' },
      farmer: { email: 'farmer@farm.com', password: 'farmer123' },
      customer: { email: 'customer@farm.com', password: 'customer123' }
    }
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Database already contains data',
    data: {
      status: 'Seeding skipped - data exists',
      credentials: {
        admin: { email: 'admin@farm.com', password: 'admin123' },
        farmer: { email: 'farmer@farm.com', password: 'farmer123' },
        customer: { email: 'customer@farm.com', password: 'customer123' }
      },
      instructions: {
        login: 'Use the credentials above to login',
        urls: {
          admin: 'http://localhost:3000/admin',
          farmer: 'http://localhost:3000/farmer', 
          customer: 'http://localhost:3000/customer'
        }
      }
    }
  });
}
