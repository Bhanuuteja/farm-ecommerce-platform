import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    const orders = await db.findOrders();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user as any)?.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    const data = await request.json();
    
    // Validate required fields
    if (!data.totalAmount || data.totalAmount <= 0) {
      return NextResponse.json({ message: 'Invalid total amount' }, { status: 400 });
    }
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ message: 'No items in order' }, { status: 400 });
    }
    
    const order = await db.createOrder({
      ...data,
      customerId: (session.user as any)?.id,
      status: 'pending'
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    const data = await request.json();
    
    const order = await db.updateOrder(data.id || data._id, data);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    const data = await request.json();
    
    await db.deleteOrder(data.id || data._id);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
