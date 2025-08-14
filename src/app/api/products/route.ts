import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const start = performance.now();
  
  try {
    const url = new URL(request.url);
    const farmerId = url.searchParams.get('farmerId');
    const category = url.searchParams.get('category');
    
    const db = await DatabaseFactory.getAdapter();
    const filter: any = {};
    
    if (farmerId) {
      filter.farmerId = farmerId;
    }
    if (category) {
      filter.category = category;
    }
    
    const products = await db.findProducts(filter);
    
    const responseTime = performance.now() - start;
    
    return NextResponse.json(products, {
      headers: {
        'X-Cache': 'DATABASE_FACTORY',
        'X-Response-Time': `${responseTime.toFixed(2)}ms`,
        'Cache-Control': 'public, max-age=120'
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    const responseTime = performance.now() - start;
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { 
        status: 500,
        headers: {
          'X-Response-Time': `${responseTime.toFixed(2)}ms`
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user as any)?.role !== 'farmer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    
    const data = await request.json();
    const product = await db.createProduct({
      ...data,
      farmerId: (session.user as any)?.id,
      farmerName: (session.user as any)?.username
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user as any)?.role !== 'farmer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    
    const data = await request.json();
    const { id, _id, ...updateData } = data;
    const productId = id || _id;
    
    const product = await db.updateProduct(productId, updateData);
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user as any)?.role !== 'farmer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await DatabaseFactory.getAdapter();
    
    const data = await request.json();
    const { _id: productId, id } = data;
    const deleteId = productId || id;
    
    if (!deleteId) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }
    
    const success = await db.deleteProduct(deleteId);
    
    if (!success) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
