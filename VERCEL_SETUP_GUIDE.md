# VERCEL ENVIRONMENT VARIABLES SETUP GUIDE

## 🔗 Access Your Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Find your project: "2" (bhanuutejas-projects/2)
3. Click on the project name

## ⚙️ Add Environment Variables:
1. Go to "Settings" tab
2. Click "Environment Variables" in the sidebar
3. Add these variables one by one:

### Required Environment Variables:

**NEXTAUTH_SECRET**
- Value: `0f8a2e9d7c5b4a3f9e6d8c2b1a5f4e3d7c9b8a6f5e4d3c2b1a9f8e7d6c5b4a3f2e1d`
- Environment: Production, Preview, Development

**NEXTAUTH_URL** 
- Value: `https://2-3cq5txqh4-bhanuutejas-projects.vercel.app`
- Environment: Production, Preview, Development

**DATABASE_TYPE**
- Value: `sqlite`
- Environment: Production, Preview, Development

**SQLITE_PATH**
- Value: `./database/farm_ecommerce.db`
- Environment: Production, Preview, Development

## 🔄 Redeploy After Adding Variables:
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy" 
4. Wait for deployment to complete

## 🧪 Test Login:
Use these default credentials:
- Admin: admin@farm.com / admin123
- Farmer: farmer@farm.com / farmer123  
- Customer: customer@farm.com / customer123

## 📱 Alternative: MongoDB Setup (Recommended for Production)
If you want to use MongoDB instead of SQLite for production:

1. Create a free MongoDB Atlas account: https://cloud.mongodb.com
2. Create a cluster and get connection string
3. Update environment variables:
   - DATABASE_TYPE: `mongodb`
   - MONGODB_URI: `your-mongodb-connection-string`
