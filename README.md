# 🌻 Farm E-commerce Platform

A modern, full-stack farm-to-table e-commerce platform built with Next.js 14, MongoDB, and TypeScript.

## 🚀 Features

### Multi-Role Authentication System
- **Admin Dashboard**: Complete system management, user administration, analytics
- **Farmer Portal**: Product management, inventory tracking, order monitoring
- **Customer Experience**: Product browsing, shopping cart, order placement

### Core Functionality
- ✅ **User Management**: Role-based access control (Admin, Farmer, Customer)
- ✅ **Product Catalog**: Category-based product organization with search
- ✅ **Shopping Cart**: Persistent cart with real-time updates
- ✅ **Order Management**: Full order lifecycle tracking
- ✅ **Analytics Dashboard**: Sales reporting and performance metrics
- ✅ **Responsive Design**: Mobile-first, modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT strategy
- **UI Components**: Lucide React icons, React Hot Toast
- **Styling**: Tailwind CSS with custom components

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Quick Start

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/farm_ecommerce
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI accordingly)
   ```

4. **Seed Database**
   ```bash
   # Start the development server first
   npm run dev
   
   # Then seed the database
   curl -X POST http://localhost:3000/api/seed
   ```

5. **Launch Application**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000)

## 👥 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| 👨‍💼 Admin | `admin` | `admin123` |
| 🌾 Farmer | `farmer_john` | `farmer123` |
| 🌾 Farmer | `farmer_mary` | `farmer123` |
| 🛒 Customer | `customer_bob` | `customer123` |
| 🛒 Customer | `customer_alice` | `customer123` |

## 📱 Application Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── farmer/             # Farmer portal
│   ├── customer/           # Customer interface
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth.js configuration
│   │   ├── admin/          # Admin API endpoints
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order management
│   │   └── seed/           # Database seeding
│   └── page.tsx            # Login page
├── components/             # Reusable components
├── lib/                    # Database connection
└── models/                 # MongoDB schemas
```

## 🔐 Authentication & Authorization

- **NextAuth.js** with custom credentials provider
- **JWT-based sessions** for scalability
- **Role-based access control** with middleware protection
- **Password hashing** using bcryptjs

## 📊 Database Schema

### Users Collection
```typescript
{
  username: string,
  email: string,
  password: string (hashed),
  role: 'admin' | 'farmer' | 'customer',
  profile: { firstName?, lastName?, phone?, address? }
}
```

### Products Collection
```typescript
{
  name: string,
  category: 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'herbs' | 'other',
  price: number,
  sku: string,
  farmerId: string,
  stock: number,
  description?: string,
  imageUrl?: string
}
```

### Orders Collection
```typescript
{
  customerId: string,
  items: [{ productId, quantity, price, productName }],
  totalAmount: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  orderDate: Date,
  shippingAddress?: string
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm_ecommerce
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🌟 Key Features Comparison

| Feature | Original PHP | New Next.js |
|---------|-------------|-------------|
| **Frontend** | Server-rendered HTML | React with SSR/SSG |
| **Authentication** | Sessions + MySQL | NextAuth.js + JWT |
| **Database** | MySQL with SQL | MongoDB with aggregation |
| **Styling** | Custom CSS | Tailwind CSS |
| **API** | PHP endpoints | Next.js API routes |
| **Type Safety** | None | Full TypeScript |
| **Performance** | Traditional | Optimized React + Next.js |

## 📈 Performance Benefits

- ⚡ **Server-Side Rendering** for faster initial page loads
- 🔄 **Incremental Static Regeneration** for dynamic content
- 📱 **Mobile-first responsive design**
- 🚀 **API route optimization** with Next.js
- 💾 **Efficient data fetching** with React hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js 14, MongoDB, and TypeScript**
