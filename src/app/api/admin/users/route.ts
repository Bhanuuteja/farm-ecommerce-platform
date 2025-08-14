import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { DatabaseFactory } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    const users = await db.findUsers();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const db = await DatabaseFactory.getAdapter();

    // Check if user already exists by email
    const existingUserByEmail = await db.findUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
    }

    // Check if user already exists by username
    const existingUserByUsername = await db.findUserByUsername(name);
    if (existingUserByUsername) {
      return NextResponse.json({ message: 'User with this username already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user - map 'name' to 'username' for database
    const newUser = await db.createUser({
      username: name,  // Map name to username for SQLite schema
      email,
      password: hashedPassword,
      role
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
