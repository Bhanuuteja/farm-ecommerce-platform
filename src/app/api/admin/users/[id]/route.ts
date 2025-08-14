import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { DatabaseFactory } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = id;
    const body = await request.json();
    
    const db = await DatabaseFactory.getAdapter();
    
    // Check if user exists
    const user = await db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Allow users to update their own profile or admins to update any profile
    const isOwner = (session.user as any)?.id === userId;
    const isAdmin = (session.user as any)?.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Update user profile
    const updatedUser = await db.updateUser(userId, body);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = id;
    
    const db = await DatabaseFactory.getAdapter();
    
    // Check if user exists
    const user = await db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Don't allow deleting the current admin user or other admins
    if (user.role === 'admin') {
      return NextResponse.json({ message: 'Cannot delete admin users' }, { status: 400 });
    }

    await db.deleteUser(userId);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
