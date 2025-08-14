import { createClient } from '@libsql/client';
import { DatabaseAdapter, DatabaseConfig, User, Product, Order, Cart } from '../types';

export class TursoAdapter implements DatabaseAdapter {
  private config: DatabaseConfig;
  private client: any = null;
  private connected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      this.client = createClient({
        url: this.config.connection.uri!,
        authToken: this.config.connection.password
      });

      // Test connection and create tables
      await this.createTables();
      
      this.connected = true;
      console.log('Turso connected successfully');
    } catch (error) {
      console.error('Turso connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.connected = false;
    }
  }

  private async createTables(): Promise<void> {
    // Users table
    await this.client.execute(`
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
    await this.client.execute(`
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await this.client.execute(`
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
    await this.client.execute(`
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
      await this.client.execute(index);
    }
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const result = await this.client.execute({
      sql: 'INSERT INTO users (username, email, password, role, profile) VALUES (?, ?, ?, ?, ?) RETURNING *',
      args: [userData.username, userData.email, userData.password, userData.role, JSON.stringify(userData.profile || {})]
    });

    return this.transformUser(result.rows[0]);
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });

    return result.rows[0] ? this.transformUser(result.rows[0]) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });

    return result.rows[0] ? this.transformUser(result.rows[0]) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${this.camelToSnake(key)} = ?`)
      .join(', ');
    
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    await this.client.execute({
      sql: `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [...values, id]
    });

    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });

    return result.rows[0] ? this.transformUser(result.rows[0]) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [id]
    });

    return result.rowsAffected > 0;
  }

  // Product operations
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const result = await this.client.execute({
      sql: 'INSERT INTO products (name, category, price, sku, farmer_id, stock, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      args: [
        productData.name,
        productData.category,
        productData.price,
        productData.sku,
        productData.farmerId,
        productData.stock || 0,
        productData.description,
        JSON.stringify(productData.images || [])
      ]
    });

    return this.transformProduct(result.rows[0]);
  }

  async findProducts(filter: any = {}): Promise<Product[]> {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const args: any[] = [];

    if (filter.farmerId) {
      sql += ' AND farmer_id = ?';
      args.push(filter.farmerId);
    }

    if (filter.category) {
      sql += ' AND category = ?';
      args.push(filter.category);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await this.client.execute({ sql, args });
    return result.rows.map((row: any) => this.transformProduct(row));
  }

  async findProductById(id: string): Promise<Product | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id]
    });

    return result.rows[0] ? this.transformProduct(result.rows[0]) : null;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${this.camelToSnake(key)} = ?`)
      .join(', ');
    
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    await this.client.execute({
      sql: `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [...values, id]
    });

    const result = await this.client.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id]
    });

    return result.rows[0] ? this.transformProduct(result.rows[0]) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id]
    });

    return result.rowsAffected > 0;
  }

  // Order operations
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const result = await this.client.execute({
      sql: 'INSERT INTO orders (customer_id, items, total_amount, status, shipping_address, order_date) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      args: [
        orderData.customerId,
        JSON.stringify(orderData.items),
        orderData.totalAmount,
        orderData.status || 'pending',
        JSON.stringify(orderData.shippingAddress),
        orderData.orderDate || new Date().toISOString()
      ]
    });

    return this.transformOrder(result.rows[0]);
  }

  async findOrders(filter: any = {}): Promise<Order[]> {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const args: any[] = [];

    if (filter.customerId) {
      sql += ' AND customer_id = ?';
      args.push(filter.customerId);
    }

    if (filter.status) {
      sql += ' AND status = ?';
      args.push(filter.status);
    }

    sql += ' ORDER BY order_date DESC';

    const result = await this.client.execute({ sql, args });
    return result.rows.map((row: any) => this.transformOrder(row));
  }

  async findOrderById(id: string): Promise<Order | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id]
    });

    return result.rows[0] ? this.transformOrder(result.rows[0]) : null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${this.camelToSnake(key)} = ?`)
      .join(', ');
    
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    await this.client.execute({
      sql: `UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [...values, id]
    });

    const result = await this.client.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id]
    });

    return result.rows[0] ? this.transformOrder(result.rows[0]) : null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM orders WHERE id = ?',
      args: [id]
    });

    return result.rowsAffected > 0;
  }

  // Cart operations
  async findCart(userId: string): Promise<Cart | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM carts WHERE customer_id = ?',
      args: [userId]
    });

    return result.rows[0] ? this.transformCart(result.rows[0]) : null;
  }

  async updateCart(userId: string, cartData: Partial<Cart>): Promise<Cart> {
    await this.client.execute({
      sql: `INSERT INTO carts (customer_id, items, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP) 
            ON CONFLICT(customer_id) 
            DO UPDATE SET items = excluded.items, updated_at = CURRENT_TIMESTAMP`,
      args: [userId, JSON.stringify(cartData.items || [])]
    });

    const result = await this.client.execute({
      sql: 'SELECT * FROM carts WHERE customer_id = ?',
      args: [userId]
    });

    return this.transformCart(result.rows[0]);
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await this.client.execute({
      sql: 'DELETE FROM carts WHERE customer_id = ?',
      args: [userId]
    });

    return result.rowsAffected > 0;
  }

  // Utility functions
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private transformUser(row: any): User {
    return {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      profile: JSON.parse(row.profile || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private transformProduct(row: any): Product {
    return {
      id: row.id.toString(),
      name: row.name,
      category: row.category,
      price: row.price,
      sku: row.sku,
      farmerId: row.farmer_id.toString(),
      stock: row.stock,
      description: row.description,
      images: JSON.parse(row.images || '[]'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private transformOrder(row: any): Order {
    return {
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: JSON.parse(row.items || '[]'),
      totalAmount: row.total_amount,
      status: row.status,
      shippingAddress: JSON.parse(row.shipping_address),
      orderDate: new Date(row.order_date),
      deliveryDate: row.delivery_date ? new Date(row.delivery_date) : undefined
    };
  }

  private transformCart(row: any): Cart {
    return {
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: JSON.parse(row.items || '[]'),
      updatedAt: new Date(row.updated_at)
    };
  }
}
