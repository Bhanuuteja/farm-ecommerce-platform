# � Farm E-commerce Platform

> **A modern, full-stack farm-to-table e-commerce platform with multi-role authentication and beautiful UI**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://2-7bsnw6yrl-bhanuutejas-projects.vercel.app)
[![GitHub](https://img.shields.io/badge/⭐%20Star%20on-GitHub-black?style=for-the-badge&logo=github)](https://github.com/Bhanuuteja/farm-ecommerce-platform)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## 🎯 **Project Highlights**

🏆 **Production-Ready** • 🚀 **Deployed on Vercel** • 💎 **Modern Tech Stack** • 🔐 **Secure Authentication**

---

## ✨ **Key Features**

### 🔐 **Multi-Role Authentication System**
- **👑 Admin Dashboard**: Complete platform management, user administration, sales analytics
- **🚜 Farmer Portal**: Product management, inventory tracking, order monitoring  
- **🛒 Customer Experience**: Browse products, shopping cart, seamless checkout
- **🤝 Agent Support**: Order processing and customer assistance

### 🛍️ **E-commerce Core**
- **📦 Product Catalog**: Category-based organization with advanced search
- **🛒 Shopping Cart**: Persistent cart with real-time updates
- **📋 Order Management**: Complete order lifecycle tracking
- **📊 Analytics**: Sales reporting and performance metrics
- **💳 Secure Checkout**: Protected payment processing

### 🎨 **Modern UI/UX**
- **🌈 Glass Morphism Design**: Beautiful, modern interface
- **📱 Fully Responsive**: Mobile-first design approach
- **⚡ Fast Loading**: Optimized performance with Next.js 14
- **🔔 Toast Notifications**: Real-time user feedback
- **✨ Smooth Animations**: Engaging user interactions

---

## � **Tech Stack**

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, React |
| **Backend** | Next.js API Routes, NextAuth.js, Node.js |
| **Database** | MongoDB, Mongoose ODM, SQLite (dev) |
| **Authentication** | NextAuth.js, JWT, bcrypt |
| **UI/UX** | Lucide React, React Hot Toast, Glass Morphism |
| **Deployment** | Vercel, GitHub Actions |

---

## 🎪 **Live Demo**

### 🌐 **Try it now**: [https://2-7bsnw6yrl-bhanuutejas-projects.vercel.app](https://2-7bsnw6yrl-bhanuutejas-projects.vercel.app)

### 🔑 **Demo Credentials**:
```
👑 Admin:    admin     / admin123  (or admin@farm.com)
🚜 Farmer:   farmer1   / farmer123  (or farmer@farm.com)
🛒 Customer: customer1 / customer123 (or customer@farm.com)
```

**Note**: You can login with either **username** or **email address**

### 📝 **Or create your own account**: Click "Create Account" and choose your role!

---

## �️ **Installation & Setup**

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### **Quick Start**

```bash
# 1. Clone the repository
git clone https://github.com/Bhanuuteja/farm-ecommerce-platform.git
cd farm-ecommerce-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000
```

### **Environment Variables**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/farm_ecommerce
# or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/farm_ecommerce

# Authentication
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: For SQLite (development)
DATABASE_TYPE=sqlite
SQLITE_PATH=./database/farm_ecommerce.db
---

## 📱 **Application Screenshots**

### 🏠 **Landing Page & Authentication**
- Beautiful glass morphism design with smooth animations
- Multi-role signup with step-by-step registration
- Secure login with role-based redirects

### 👑 **Admin Dashboard**
- Comprehensive user management
- Sales analytics and reporting
- Product and order oversight

### 🚜 **Farmer Portal**  
- Intuitive product management
- Real-time inventory tracking
- Order processing workflow

### 🛒 **Customer Experience**
- Browse fresh farm products
- Interactive shopping cart
- Seamless checkout process

---

## 🏗️ **Project Architecture**

```
src/
├── app/
│   ├── api/                # API Routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order processing
│   │   └── users/          # User management
│   ├── admin/              # Admin dashboard
│   ├── farmer/             # Farmer portal  
│   ├── customer/           # Customer interface
│   ├── agent/              # Agent support
│   └── signup/             # Registration system
├── components/             # Reusable UI components
├── lib/                    # Utilities & configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── mongodb.ts         # Database connection
│   └── database/          # Database adapters
├── models/                # Database schemas
└── types/                 # TypeScript definitions
```

---

## 🔑 **Key Technical Features**

### 🛡️ **Security**
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage  
- **Role-based Access**: Granular permission controls
- **Input Validation**: Comprehensive data validation

### ⚡ **Performance**
- **SSR/SSG**: Server-side rendering for optimal performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Optimized MongoDB queries

### � **State Management**
- **React Context**: Global state management
- **Local Storage**: Cart persistence
- **Session Management**: NextAuth.js integration
- **Real-time Updates**: Live data synchronization

---

## � **Deployment**

### **Vercel (Recommended)**
1. Fork this repository
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### **Manual Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Environment Variables for Production**
```env
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/farm_ecommerce
```

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

### **Development Workflow**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Bhanu Uteja**
- GitHub: [@Bhanuuteja](https://github.com/Bhanuuteja)
- LinkedIn: [Connect with me](https://linkedin.com/in/bhanuuteja)

---

## ⭐ **Show your support**

Give a ⭐️ if this project helped you!

---

<div align="center">

**🌾 Built with ❤️ for farmers and fresh food lovers 🌾**

*Made with Next.js 14, TypeScript, and modern web technologies*

</div>
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
