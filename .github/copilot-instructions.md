<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Farm E-commerce Platform - Copilot Instructions

This is a Next.js 14 farm e-commerce platform with the following specifications:

## Project Structure
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT strategy
- **State Management**: React Context API + localStorage for cart

## User Roles & Permissions
1. **Admin**: Full system access, user management, analytics, sales reports
2. **Farmer**: Product management, order tracking, inventory management
3. **Customer**: Browse products, shopping cart, order placement, order history

## Key Features to Implement
- Multi-role authentication system
- Product catalog with categories (vegetables, fruits, dairy, etc.)
- Shopping cart functionality with persistence
- Order management system
- Admin dashboard with analytics
- Farmer dashboard for product/inventory management
- Customer dashboard for shopping and order tracking
- Sales reporting and farmer performance analytics

## Database Schema (MongoDB)
- Users collection: { _id, username, email, password, role, profile }
- Products collection: { _id, name, category, price, sku, farmerId, stock, description }
- Orders collection: { _id, customerId, items[], totalAmount, status, orderDate }
- Cart collection: { _id, customerId, items[], updatedAt }

## API Routes Structure
- `/api/auth/*` - NextAuth.js authentication endpoints
- `/api/users/*` - User management (admin only)
- `/api/products/*` - Product CRUD operations
- `/api/orders/*` - Order management
- `/api/cart/*` - Shopping cart operations
- `/api/analytics/*` - Sales and performance data

## UI/UX Guidelines
- Modern, clean design with agricultural/farm theme
- Responsive design for mobile and desktop
- Accessible components with proper ARIA labels
- Loading states and error handling
- Toast notifications for user actions

## Code Standards
- Use TypeScript strict mode
- Implement proper error handling with try-catch blocks
- Use Next.js App Router conventions
- Follow React best practices with hooks
- Implement proper API validation with Zod
- Use Tailwind CSS classes consistently
- Add proper TypeScript interfaces for all data models
