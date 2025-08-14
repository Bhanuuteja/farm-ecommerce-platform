import sqlite3 from 'sqlite3';
import { DatabaseAdapter, DatabaseConfig, User, Product, Order, Cart } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class SQLiteAdapter implements DatabaseAdapter {
  private config: DatabaseConfig;
  private db: sqlite3.Database | null = null;
  private connected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      const dbPath = this.config.connection.path!;
      
      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath);
      
      // Enable foreign keys and WAL mode
      await this.run('PRAGMA foreign_keys = ON');
      await this.run('PRAGMA journal_mode = WAL');

      // Create tables
      await this.createTables();
      
      this.connected = true;
      console.log('SQLite connected successfully');
    } catch (error) {
      console.error('SQLite connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      return new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else {
            this.db = null;
            this.connected = false;
            resolve();
          }
        });
      });
    }
  }

  private async run(sql: string, ...params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  private async get(sql: string, ...params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  private async all(sql: string, ...params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  private async createTables(): Promise<void> {
    // Users table
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'farmer', 'customer')),
        profile TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await this.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        farmer_id INTEGER NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        images TEXT DEFAULT '[]',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add is_active column to existing products table if it doesn't exist
    try {
      await this.run(`ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`);
    } catch (error) {
      // Column already exists, ignore error
    }

    // Orders table
    await this.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        items TEXT NOT NULL DEFAULT '[]',
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
        shipping_address TEXT NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Carts table
    await this.run(`
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER UNIQUE NOT NULL,
        items TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
      'CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)',
      'CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id)'
    ];

    for (const index of indexes) {
      await this.run(index);
    }

    // Create triggers for updated_at
    const tables = ['users', 'products', 'orders', 'carts'];
    for (const table of tables) {
      await this.run(`
        CREATE TRIGGER IF NOT EXISTS update_${table}_updated_at 
        AFTER UPDATE ON ${table}
        FOR EACH ROW
        BEGIN
          UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);
    }
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const result = await this.run(
      'INSERT INTO users (username, email, password, role, profile) VALUES (?, ?, ?, ?, ?)',
      userData.username,
      userData.email,
      userData.password,
      userData.role,
      JSON.stringify(userData.profile || {})
    );

    const user = await this.get('SELECT * FROM users WHERE id = ?', result.lastID);
    return this.transformUser(user);
  }

  async findUsers(filter: any = {}): Promise<User[]> {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (filter.role) {
      query += ' AND role = ?';
      params.push(filter.role);
    }

    if (filter.email) {
      query += ' AND email = ?';
      params.push(filter.email);
    }

    query += ' ORDER BY created_at DESC';

    const users = await this.all(query, ...params);
    return users.map((user: any) => this.transformUser(user));
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.get('SELECT * FROM users WHERE id = ?', id);
    return user ? this.transformUser(user) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.get('SELECT * FROM users WHERE email = ?', email);
    return user ? this.transformUser(user) : null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.get('SELECT * FROM users WHERE username = ?', username);
    return user ? this.transformUser(user) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      if (field === 'profile' && typeof updates[field as keyof User] === 'object') {
        return JSON.stringify(updates[field as keyof User]);
      }
      return updates[field as keyof User];
    });

    await this.run(`UPDATE users SET ${setClause} WHERE id = ?`, ...values, id);
    const user = await this.get('SELECT * FROM users WHERE id = ?', id);
    return user ? this.transformUser(user) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.run('DELETE FROM users WHERE id = ?', id);
    return result.changes > 0;
  }

  // Product operations
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const result = await this.run(
      'INSERT INTO products (name, category, price, sku, farmer_id, stock, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      productData.name,
      productData.category,
      productData.price,
      productData.sku,
      productData.farmerId,
      productData.stock || 0,
      productData.description,
      JSON.stringify(productData.images || [])
    );

    const product = await this.get('SELECT * FROM products WHERE id = ?', result.lastID);
    return this.transformProduct(product);
  }

  async findProducts(filter: any = {}): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filter.category) {
      query += ' AND category = ?';
      params.push(filter.category);
    }

    if (filter.farmerId) {
      query += ' AND farmer_id = ?';
      params.push(filter.farmerId);
    }

    if (filter.inStock) {
      query += ' AND stock > 0';
    }

    query += ' ORDER BY created_at DESC';

    const products = await this.all(query, ...params);
    return products.map((product: any) => this.transformProduct(product));
  }

  async findProductById(id: string): Promise<Product | null> {
    const product = await this.get('SELECT * FROM products WHERE id = ?', id);
    return product ? this.transformProduct(product) : null;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    // Valid database columns for products table
    const validColumns = [
      'name', 'category', 'price', 'sku', 'farmer_id', 'stock', 'description', 'images', 'is_active'
    ];
    
    // Filter out invalid fields and map frontend fields to database columns
    const filteredUpdates: { [key: string]: any } = {};
    
    Object.keys(updates).forEach(key => {
      if (key === 'id' || key === '_id' || key === 'createdAt' || key === 'updatedAt') {
        // Skip these fields - they shouldn't be updated
        return;
      }
      
      // Map frontend field names to database column names
      let dbColumn = key;
      if (key === 'farmerId') dbColumn = 'farmer_id';
      else if (key === 'stockQuantity') dbColumn = 'stock';
      else if (key === 'stock_quantity') dbColumn = 'stock';
      
      // Convert boolean to integer for SQLite
      let value = updates[key as keyof Product];
      if (key === 'is_active' && typeof value === 'boolean') {
        value = value ? 1 : 0;
      }
      
      // Only include valid columns
      if (validColumns.includes(dbColumn)) {
        filteredUpdates[dbColumn] = value;
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      console.log('No valid fields to update');
      const product = await this.get('SELECT * FROM products WHERE id = ?', id);
      return product ? this.transformProduct(product) : null;
    }

    const fields = Object.keys(filteredUpdates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      if (field === 'images' && Array.isArray(filteredUpdates[field])) {
        return JSON.stringify(filteredUpdates[field]);
      }
      return filteredUpdates[field];
    });

    console.log('Updating product:', { id, setClause, values, filteredUpdates });
    
    await this.run(`UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...values, id);
    const product = await this.get('SELECT * FROM products WHERE id = ?', id);
    return product ? this.transformProduct(product) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.run('DELETE FROM products WHERE id = ?', id);
    return result.changes > 0;
  }

  // Order operations
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const result = await this.run(
      'INSERT INTO orders (customer_id, items, total_amount, status, shipping_address) VALUES (?, ?, ?, ?, ?)',
      orderData.customerId,
      JSON.stringify(orderData.items),
      orderData.totalAmount,
      orderData.status || 'pending',
      JSON.stringify(orderData.shippingAddress || {})
    );

    const order = await this.get('SELECT * FROM orders WHERE id = ?', result.lastID);
    return this.transformOrder(order);
  }

  async findOrders(filter: any = {}): Promise<Order[]> {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (filter.customerId) {
      query += ' AND customer_id = ?';
      params.push(filter.customerId);
    }

    if (filter.status) {
      query += ' AND status = ?';
      params.push(filter.status);
    }

    query += ' ORDER BY created_at DESC';

    const orders = await this.all(query, ...params);
    return orders.map((order: any) => this.transformOrder(order));
  }

  async findOrderById(id: string): Promise<Order | null> {
    const order = await this.get('SELECT * FROM orders WHERE id = ?', id);
    return order ? this.transformOrder(order) : null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== '_id' && key !== 'orderId');
    const setClause = fields.map(field => {
      if (field === 'customerId') return 'customer_id = ?';
      if (field === 'totalAmount') return 'total_amount = ?';
      if (field === 'shippingAddress') return 'shipping_address = ?';
      return `${field} = ?`;
    }).join(', ');
    
    const values = fields.map(field => {
      if (field === 'items' || field === 'shippingAddress') {
        return JSON.stringify(updates[field as keyof Order]);
      }
      return updates[field as keyof Order];
    });

    await this.run(`UPDATE orders SET ${setClause} WHERE id = ?`, ...values, id);
    const order = await this.get('SELECT * FROM orders WHERE id = ?', id);
    return order ? this.transformOrder(order) : null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await this.run('DELETE FROM orders WHERE id = ?', id);
    return result.changes > 0;
  }

  // Cart operations
  async findCart(userId: string): Promise<Cart | null> {
    const cart = await this.get('SELECT * FROM carts WHERE customer_id = ?', userId);
    return cart ? this.transformCart(cart) : null;
  }

  async updateCart(userId: string, cartData: Partial<Cart>): Promise<Cart> {
    const existingCart = await this.get('SELECT * FROM carts WHERE customer_id = ?', userId);
    
    if (existingCart) {
      await this.run(
        'UPDATE carts SET items = ? WHERE customer_id = ?',
        JSON.stringify(cartData.items || []),
        userId
      );
    } else {
      await this.run(
        'INSERT INTO carts (customer_id, items) VALUES (?, ?)',
        userId,
        JSON.stringify(cartData.items || [])
      );
    }

    const cart = await this.get('SELECT * FROM carts WHERE customer_id = ?', userId);
    return this.transformCart(cart);
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await this.run('DELETE FROM carts WHERE customer_id = ?', userId);
    return result.changes > 0;
  }

  // Legacy method for compatibility
  async getCart(userId: string): Promise<Cart | null> {
    return this.findCart(userId);
  }

  async saveCart(userId: string, cartData: Partial<Cart>): Promise<Cart> {
    return this.updateCart(userId, cartData);
  }

  // Transform methods
  private transformUser(row: any): User {
    if (!row) return null as any;
    return {
      _id: row.id.toString(),
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      profile: JSON.parse(row.profile || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    } as any;
  }

  private transformProduct(row: any): Product {
    if (!row) return null as any;
    return {
      _id: row.id.toString(),
      id: row.id.toString(),
      name: row.name,
      category: row.category,
      price: row.price,
      sku: row.sku,
      farmerId: row.farmer_id.toString(),
      stock: row.stock,
      stock_quantity: row.stock, // Add this for frontend compatibility
      description: row.description,
      images: JSON.parse(row.images || '[]'),
      is_active: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    } as any;
  }

  private transformOrder(row: any): Order {
    if (!row) return null as any;
    return {
      _id: row.id.toString(),
      id: row.id,
      customerId: row.customer_id.toString(),
      user_id: row.customer_id, // Add for frontend compatibility
      farmer_id: null, // Orders don't have farmer_id in this schema
      items: JSON.parse(row.items || '[]'),
      totalAmount: row.total_amount,
      total_amount: row.total_amount, // Add for frontend compatibility
      status: row.status,
      orderDate: new Date(row.order_date),
      created_at: row.order_date, // Add for frontend compatibility
      deliveryDate: row.delivery_date ? new Date(row.delivery_date) : undefined,
      shippingAddress: JSON.parse(row.shipping_address || '{}')
    } as any;
  }

  private transformCart(row: any): Cart {
    if (!row) return null as any;
    return {
      _id: row.id.toString(),
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: JSON.parse(row.items || '[]'),
      updatedAt: new Date(row.updated_at)
    } as any;
  }
}
