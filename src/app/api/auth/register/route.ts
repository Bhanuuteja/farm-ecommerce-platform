import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DatabaseFactory } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role, profile } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Default role to 'customer' if not provided
    const userRole = role || 'customer';
    
    // Validate role
    const validRoles = ['admin', 'farmer', 'customer', 'agent'];
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const db = await DatabaseFactory.getAdapter();

    // Check if user already exists
    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      username,
      email,
      password: hashedPassword,
      role: userRole,
      profile: profile || {
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
      },
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const user = await db.createUser(userData);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment && error instanceof Error 
      ? error.message 
      : 'Internal server error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(isDevelopment && { stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    );
  }
}
