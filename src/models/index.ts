import mongoose, { Document, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'farmer' | 'customer';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Product Interface
export interface IProduct extends Document {
  _id: string;
  name: string;
  category: 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'herbs' | 'other';
  price: number;
  sku: string;
  farmerId: string;
  stock: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Interface
export interface IOrder extends Document {
  _id: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    productName: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Interface
export interface ICart extends Document {
  _id: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'farmer', 'customer'], required: true, index: true },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
  },
}, {
  timestamps: true,
});

// Add compound indexes for better query performance
userSchema.index({ username: 1, role: 1 });
userSchema.index({ email: 1, role: 1 });

// Product Schema
const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: ['vegetables', 'fruits', 'dairy', 'grains', 'herbs', 'other'], 
    required: true,
    index: true
  },
  price: { type: Number, required: true, min: 0, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  farmerId: { type: String, required: true, index: true },
  stock: { type: Number, required: true, min: 0, index: true },
  description: String,
  imageUrl: String,
}, {
  timestamps: true,
});

// Add compound indexes for common queries
productSchema.index({ farmerId: 1, category: 1 });
productSchema.index({ farmerId: 1, createdAt: -1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ stock: 1, farmerId: 1 });

// Order Schema
const orderSchema = new Schema<IOrder>({
  customerId: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    productName: { type: String, required: true },
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  orderDate: { type: Date, default: Date.now, index: true },
  shippingAddress: String,
}, {
  timestamps: true,
});

// Add compound indexes for order queries
orderSchema.index({ customerId: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ 'items.productId': 1 });

// Cart Schema
const cartSchema = new Schema<ICart>({
  customerId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
}, {
  timestamps: true,
});

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);
