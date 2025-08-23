import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET() {
  return NextResponse.json({
    message: 'Production database seeder',
    instructions: 'Use POST to seed the database with demo data',
    note: 'This will create admin, farmer, and customer accounts with sample products'
  });
}

export async function POST() {
  try {
    const db = await DatabaseFactory.getAdapter();

    console.log('🌱 Seeding production database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await db.createUser({
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

    // Create farmer user
    const farmerPassword = await bcrypt.hash('farmer123', 12);
    const farmer = await db.createUser({
      username: 'farmer1',
      email: 'farmer@farm.com',
      password: farmerPassword,
      role: 'farmer',
      profile: {
        firstName: 'John',
        lastName: 'Farmer',
        phone: '+1234567891',
        address: '123 Farm Road, Rural County'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customer = await db.createUser({
      username: 'customer1',
      email: 'customer@farm.com',
      password: customerPassword,
      role: 'customer',
      profile: {
        firstName: 'Jane',
        lastName: 'Customer',
        phone: '+1234567892',
        address: '456 City Street, Urban County'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create some sample products
    const products = [
      {
        name: 'Organic Tomatoes',
        category: 'vegetables',
        price: 4.99,
        sku: 'VEG-TOM-001',
        farmerId: farmer.id,
        stock: 50,
        description: 'Fresh organic tomatoes grown locally',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fresh Apples',
        category: 'fruits',
        price: 3.99,
        sku: 'FRT-APP-001',
        farmerId: farmer.id,
        stock: 30,
        description: 'Crisp and sweet apples',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Farm Fresh Milk',
        category: 'dairy',
        price: 2.99,
        sku: 'DAI-MLK-001',
        farmerId: farmer.id,
        stock: 20,
        description: 'Pure farm fresh milk',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const product of products) {
      await db.createProduct(product);
    }

    return NextResponse.json({
      success: true,
      message: 'Production database seeded successfully!',
      data: {
        users: 3,
        products: products.length,
        credentials: {
          admin: { username: 'admin', email: 'admin@farm.com', password: 'admin123' },
          farmer: { username: 'farmer1', email: 'farmer@farm.com', password: 'farmer123' },
          customer: { username: 'customer1', email: 'customer@farm.com', password: 'customer123' }
        }
      }
    });

  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
