import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { DatabaseFactory } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const updateData = await request.json();

    console.log('Product update request:', { productId, updateData });

    const db = await DatabaseFactory.getAdapter();
    
    // Check if product exists
    const product = await db.findProductById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    console.log('Existing product:', product);

    // Update product
    const updatedProduct = await db.updateProduct(productId, updateData);

    console.log('Updated product result:', updatedProduct);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const db = await DatabaseFactory.getAdapter();
    
    // Check if product exists
    const product = await db.findProductById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    await db.deleteProduct(productId);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
