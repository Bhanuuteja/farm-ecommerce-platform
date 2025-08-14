import mongoose from 'mongoose';
import { DatabaseAdapter, DatabaseConfig, User, Product, Order, Cart } from '../types';

// Mongoose schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'farmer', 'customer'], required: true, index: true },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String
  }
}, { 
  timestamps: true,
  collection: 'users'
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  farmerId: { type: String, required: true, index: true },
  stock: { type: Number, required: true, index: true },
  description: String,
  images: [String]
}, { 
  timestamps: true,
  collection: 'products'
});

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending',
    index: true 
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  orderDate: { type: Date, default: Date.now, index: true },
  deliveryDate: Date
}, { 
  timestamps: true,
  collection: 'orders'
});

const cartSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true }
  }]
}, { 
  timestamps: true,
  collection: 'carts'
});

// Compound indexes for performance
userSchema.index({ email: 1, role: 1 });
productSchema.index({ farmerId: 1, category: 1 });
productSchema.index({ category: 1, price: 1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ orderDate: -1, status: 1 });

// Models
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
const CartModel = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export class MongoDBAdapter implements DatabaseAdapter {
  private config: DatabaseConfig;
  private connected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      const uri = this.config.connection.uri!;
      await mongoose.connect(uri, {
        maxPoolSize: this.config.options?.poolSize || 50,
        serverSelectionTimeoutMS: this.config.options?.timeout || 1500,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 1500,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        w: 'majority'
      });
      this.connected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await mongoose.disconnect();
      this.connected = false;
    }
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const user = new UserModel(userData);
    const saved = await user.save();
    return this.transformUser(saved);
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).lean();
    return user ? this.transformUser(user) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? this.transformUser(user) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return user ? this.transformUser(user) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  // Product operations
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = new ProductModel(productData);
    const saved = await product.save();
    return this.transformProduct(saved);
  }

  async findProducts(filter: any = {}): Promise<Product[]> {
    const products = await ProductModel.find(filter).lean();
    return products.map(product => this.transformProduct(product));
  }

  async findProductById(id: string): Promise<Product | null> {
    const product = await ProductModel.findById(id).lean();
    return product ? this.transformProduct(product) : null;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const product = await ProductModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return product ? this.transformProduct(product) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  // Order operations
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = new OrderModel(orderData);
    const saved = await order.save();
    return this.transformOrder(saved);
  }

  async findOrders(filter: any = {}): Promise<Order[]> {
    const orders = await OrderModel.find(filter).sort({ orderDate: -1 }).lean();
    return orders.map(order => this.transformOrder(order));
  }

  async findOrderById(id: string): Promise<Order | null> {
    const order = await OrderModel.findById(id).lean();
    return order ? this.transformOrder(order) : null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = await OrderModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return order ? this.transformOrder(order) : null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await OrderModel.findByIdAndDelete(id);
    return !!result;
  }

  // Cart operations
  async findCart(userId: string): Promise<Cart | null> {
    const cart = await CartModel.findOne({ customerId: userId }).lean();
    return cart ? this.transformCart(cart) : null;
  }

  async updateCart(userId: string, cartData: Partial<Cart>): Promise<Cart> {
    const cart = await CartModel.findOneAndUpdate(
      { customerId: userId },
      { ...cartData, customerId: userId },
      { new: true, upsert: true }
    ).lean();
    return this.transformCart(cart);
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await CartModel.findOneAndDelete({ customerId: userId });
    return !!result;
  }

  // Transform functions to ensure consistent ID format
  private transformUser(user: any): User {
    return {
      ...user,
      id: user._id?.toString() || user.id,
      _id: undefined
    };
  }

  private transformProduct(product: any): Product {
    return {
      ...product,
      id: product._id?.toString() || product.id,
      _id: undefined
    };
  }

  private transformOrder(order: any): Order {
    return {
      ...order,
      id: order._id?.toString() || order.id,
      _id: undefined
    };
  }

  private transformCart(cart: any): Cart {
    return {
      ...cart,
      id: cart._id?.toString() || cart.id,
      _id: undefined
    };
  }
}
