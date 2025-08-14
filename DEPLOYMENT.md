# Deployment Guide for Farm E-commerce Platform

## Quick Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add these environment variables:
   ```
   NEXTAUTH_SECRET=your-generated-secret-key
   NEXTAUTH_URL=https://your-domain.vercel.app
   DATABASE_TYPE=mongodb
   MONGODB_URI=your-mongodb-connection-string
   ```

### Method 2: Using GitHub + Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables

### Required Environment Variables

Set these in your Vercel dashboard:

```env
# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Database (choose one)
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm_ecommerce

# Alternative: Use Vercel Postgres
# DATABASE_TYPE=postgres
# POSTGRES_URL=your-vercel-postgres-url

# Alternative: Use PlanetScale MySQL
# DATABASE_TYPE=mysql
# MYSQL_URL=your-planetscale-mysql-url
```

### Database Recommendations for Production

1. **MongoDB Atlas** (Recommended):
   - Free tier available
   - Easy setup
   - Good for MVP

2. **Vercel Postgres**:
   - Integrated with Vercel
   - Pay per usage

3. **PlanetScale MySQL**:
   - Serverless MySQL
   - Good performance

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use online generator: https://generate-secret.vercel.app/32

### Post-Deployment Setup

1. **Seed Initial Data**:
   Visit: `https://your-domain.vercel.app/api/seed-new`

2. **Test Login**:
   - Admin: admin / admin123
   - Farmer: farmer1 / farmer123
   - Customer: customer1 / customer123

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update NEXTAUTH_URL to your custom domain

### Performance Optimizations

The build includes:
- ✅ Static page generation
- ✅ Image optimization ready
- ✅ Bundle optimization
- ✅ Edge runtime compatible

### Troubleshooting

1. **Build Errors**: ESLint and TypeScript checking are disabled for deployment
2. **Database Issues**: Check your connection string format
3. **Authentication Issues**: Verify NEXTAUTH_SECRET and NEXTAUTH_URL

### Monitoring

- Check Vercel Analytics
- Monitor function logs in Vercel dashboard
- Set up error tracking if needed
