// Database Adapter Interface
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // User operations
  createUser(userData: any): Promise<any>;
  findUsers(filter?: any): Promise<any[]>;
  findUserById(id: string): Promise<any>;
  findUserByEmail(email: string): Promise<any>;
  findUserByUsername(username: string): Promise<any>;
  updateUser(id: string, updates: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;
  
  // Product operations
  createProduct(productData: any): Promise<any>;
  findProducts(filter?: any): Promise<any[]>;
  findProductById(id: string): Promise<any>;
  updateProduct(id: string, updates: any): Promise<any>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Order operations
  createOrder(orderData: any): Promise<any>;
  findOrders(filter?: any): Promise<any[]>;
  findOrderById(id: string): Promise<any>;
  updateOrder(id: string, updates: any): Promise<any>;
  deleteOrder(id: string): Promise<boolean>;
  
  // Cart operations
  findCart(userId: string): Promise<any>;
  updateCart(userId: string, cartData: any): Promise<any>;
  clearCart(userId: string): Promise<boolean>;
}

// Database configuration type
export interface DatabaseConfig {
  type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite' | 'turso';
  connection: {
    uri?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    path?: string; // for SQLite
  };
  options?: {
    poolSize?: number;
    timeout?: number;
    retryAttempts?: number;
  };
}

// User schema interface
export interface User {
  id: string;
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

// Product schema interface
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sku: string;
  farmerId: string;
  stock: number;
  description?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Order schema interface
export interface Order {
  id: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: Date;
  deliveryDate?: Date;
}

// Cart schema interface
export interface Cart {
  id: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }[];
  updatedAt: Date;
}
