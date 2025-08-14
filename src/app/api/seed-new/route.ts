import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const db = await DatabaseFactory.getAdapter();
    
    // Check if we have any users
    const users = await db.findUsers();
    
    return NextResponse.json({
      success: true,
      hasData: users && users.length > 0,
      users: users ? users.length : 0,
      credentials: {
        admin: { username: 'admin', password: 'admin123' },
        farmer: { username: 'farmer1', password: 'farmer123' },
        customer: { username: 'customer1', password: 'customer123' }
      }
    });
  } catch (error: any) {
    console.error('Error checking seed data:', error);
    return NextResponse.json({
      success: false,
      hasData: false,
      error: error.message
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await DatabaseFactory.getAdapter();

    console.log('🌱 Starting database seeding...');

    // Check if admin user already exists
    let admin = await db.findUserByEmail('admin@farm.com');
    if (!admin) {
      // Create admin user
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
    }

    console.log('👤 Admin user ready:', admin.email);

    // Check if farmer user already exists
    let farmer = await db.findUserByEmail('farmer@farm.com');
    if (!farmer) {
      // Create farmer user
      const farmerPassword = await bcrypt.hash('farmer123', 12);
      farmer = await db.createUser({
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
    }

    console.log('👤 Farmer user ready:', farmer.email);

    // Check if customer user already exists
    let customer = await db.findUserByEmail('customer@farm.com');
    if (!customer) {
      // Create customer user
      const customerPassword = await bcrypt.hash('customer123', 12);
      customer = await db.createUser({
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
    }

    console.log('👤 Customer user ready:', customer.email);

    console.log('✅ Users ready successfully');

    // Check if products already exist
    const existingProducts = await db.findProducts();
    if (existingProducts && existingProducts.length > 0) {
      console.log('📦 Products already exist, skipping product creation');
    } else {
      // Create sample products
      const products = [
      {
        name: 'Fresh Carrots',
        category: 'vegetables',
        price: 2.99,
        sku: 'VEG001',
        farmerId: farmer.id,
        stock: 50,
        description: 'Organic carrots grown without pesticides',
        images: ['/images/carrots.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ripe Tomatoes',
        category: 'vegetables',
        price: 4.99,
        sku: 'VEG002',
        farmerId: farmer.id,
        stock: 30,
        description: 'Fresh tomatoes perfect for salads and cooking',
        images: ['/images/tomatoes.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Green Lettuce',
        category: 'vegetables',
        price: 1.99,
        sku: 'VEG003',
        farmerId: farmer.id,
        stock: 25,
        description: 'Crisp lettuce leaves for fresh salads',
        images: ['/images/lettuce.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Red Apples',
        category: 'fruits',
        price: 3.99,
        sku: 'FRT001',
        farmerId: farmer.id,
        stock: 40,
        description: 'Sweet and crunchy red apples',
        images: ['/images/apples.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fresh Bananas',
        category: 'fruits',
        price: 2.49,
        sku: 'FRT002',
        farmerId: farmer.id,
        stock: 60,
        description: 'Ripe bananas perfect for smoothies',
        images: ['/images/bananas.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Orange Oranges',
        category: 'fruits',
        price: 3.49,
        sku: 'FRT003',
        farmerId: farmer.id,
        stock: 35,
        description: 'Juicy oranges packed with vitamin C',
        images: ['/images/oranges.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fresh Milk',
        category: 'dairy',
        price: 4.99,
        sku: 'DRY001',
        farmerId: farmer.id,
        stock: 20,
        description: 'Fresh farm milk from grass-fed cows',
        images: ['/images/milk.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Farm Eggs',
        category: 'dairy',
        price: 5.99,
        sku: 'DRY002',
        farmerId: farmer.id,
        stock: 15,
        description: 'Free-range chicken eggs',
        images: ['/images/eggs.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

      // Create products
      const createdProducts = [];
      for (const productData of products) {
        const product = await db.createProduct(productData);
        createdProducts.push(product);
      }

      console.log('✅ Products created successfully');
    }

    // Get existing products for order creation
    const allProducts = await db.findProducts();
    
    // Check if orders already exist
    const existingOrders = await db.findOrders();
    if (existingOrders && existingOrders.length > 0) {
      console.log('📋 Orders already exist, skipping order creation');
    } else if (allProducts && allProducts.length > 0) {
      // Create sample order
      const sampleOrder = {
        customerId: customer.id,
        items: [
          {
            productId: allProducts[0].id,
            quantity: 2,
            price: allProducts[0].price,
            name: allProducts[0].name
          },
          {
            productId: allProducts[3] ? allProducts[3].id : allProducts[0].id,
            quantity: 1,
            price: allProducts[3] ? allProducts[3].price : allProducts[0].price,
            name: allProducts[3] ? allProducts[3].name : allProducts[0].name
          }
        ],
        totalAmount: (allProducts[0].price * 2) + (allProducts[3] ? allProducts[3].price : allProducts[0].price),
        status: 'pending' as const,
        shippingAddress: {
          street: '456 City Street',
          city: 'Urban County',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.createOrder(sampleOrder);

      console.log('✅ Sample order created successfully');
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: 3,
        products: allProducts ? allProducts.length : 0,
        orders: existingOrders ? existingOrders.length : 1
      },
      credentials: {
        admin: { email: 'admin@farm.com', password: 'admin123' },
        farmer: { email: 'farmer@farm.com', password: 'farmer123' },
        customer: { email: 'customer@farm.com', password: 'customer123' }
      }
    });

  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed database',
      error: error.message
    }, { status: 500 });
  }
}
