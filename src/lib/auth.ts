import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DatabaseFactory } from '@/lib/database';
import type { NextAuthOptions } from 'next-auth';

// Auto-seed function for in-memory database
async function seedDatabase(db: any) {
  try {
    console.log('🌱 Auto-seeding database with demo users...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await db.createUser({
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
    await db.createUser({
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
    await db.createUser({
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

    console.log('✅ Auto-seeding completed successfully');
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error);
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const db = await DatabaseFactory.getAdapter();
          
          // Auto-seed database if no users exist (for in-memory database)
          const allUsers = await db.findUsers();
          if (!allUsers || allUsers.length === 0) {
            console.log('No users found, auto-seeding database...');
            await seedDatabase(db);
          }
          
          // Try to find user by username first, then by email
          let user = await db.findUserByUsername(credentials.username as string);
          if (!user) {
            user = await db.findUserByEmail(credentials.username as string);
          }

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string, 
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};


