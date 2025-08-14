import mysql from 'mysql2/promise';
import { DatabaseAdapter, DatabaseConfig, User, Product, Order, Cart } from '../types';

export class MySQLAdapter implements DatabaseAdapter {
  private config: DatabaseConfig;
  private pool: mysql.Pool | null = null;
  private connected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      this.pool = mysql.createPool({
        uri: this.config.connection.uri,
        connectionLimit: this.config.options?.poolSize || 20,
        acquireTimeout: this.config.options?.timeout || 5000,
        timeout: 60000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const connection = await this.pool.getConnection();
      await this.createTables(connection);
      connection.release();
      
      this.connected = true;
      console.log('MySQL connected successfully');
    } catch (error) {
      console.error('MySQL connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
    }
  }

  private async createTables(connection: mysql.PoolConnection): Promise<void> {
    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'farmer', 'customer') NOT NULL,
        profile JSON DEFAULT ('{}'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role),
        INDEX idx_users_username (username)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        farmer_id INT NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        description TEXT,
        images JSON DEFAULT ('[]'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_products_category (category),
        INDEX idx_products_farmer_id (farmer_id),
        INDEX idx_products_sku (sku),
        INDEX idx_products_name (name)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        items JSON NOT NULL DEFAULT ('[]'),
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
        shipping_address JSON NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orders_customer_id (customer_id),
        INDEX idx_orders_status (status),
        INDEX idx_orders_date (order_date DESC)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT UNIQUE NOT NULL,
        items JSON NOT NULL DEFAULT ('[]'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_carts_customer_id (customer_id)
      )
    `);
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const [result] = await this.pool!.execute(
      'INSERT INTO users (username, email, password, role, profile) VALUES (?, ?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.role, JSON.stringify(userData.profile || {})]
    ) as mysql.ResultSetHeader[];

    const [rows] = await this.pool!.execute('SELECT * FROM users WHERE id = ?', [result.insertId]) as any[];
    return this.transformUser(rows[0]);
  }

  async findUserById(id: string): Promise<User | null> {
    const [rows] = await this.pool!.execute('SELECT * FROM users WHERE id = ?', [id]) as any[];
    return rows[0] ? this.transformUser(rows[0]) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool!.execute('SELECT * FROM users WHERE email = ?', [email]) as any[];
    return rows[0] ? this.transformUser(rows[0]) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${this.camelToSnake(key)} = ?`)
      .join(', ');
    
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    await this.pool!.execute(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    
    const [rows] = await this.pool!.execute('SELECT * FROM users WHERE id = ?', [id]) as any[];
    return rows[0] ? this.transformUser(rows[0]) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const [result] = await this.pool!.execute('DELETE FROM users WHERE id = ?', [id]) as mysql.ResultSetHeader[];
    return result.affectedRows > 0;
  }

  // Product operations
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const [result] = await this.pool!.execute(
      'INSERT INTO products (name, category, price, sku, farmer_id, stock, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        productData.name,
        productData.category,
        productData.price,
        productData.sku,
        productData.farmerId,
        productData.stock || 0,
        productData.description,
        JSON.stringify(productData.images || [])
      ]
    ) as mysql.ResultSetHeader[];

    const [rows] = await this.pool!.execute('SELECT * FROM products WHERE id = ?', [result.insertId]) as any[];
    return this.transformProduct(rows[0]);
  }

  async findProducts(filter: any = {}): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filter.farmerId) {
      query += ' AND farmer_id = ?';
      params.push(filter.farmerId);
    }

    if (filter.category) {
      query += ' AND category = ?';
      params.push(filter.category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await this.pool!.execute(query, params) as any[];
    return rows.map((row: any) => this.transformProduct(row));
  }

  async findProductById(id: string): Promise<Product | null> {
    const [rows] = await this.pool!.execute('SELECT * FROM products WHERE id = ?', [id]) as any[];
    return rows[0] ? this.transformProduct(rows[0]) : null;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${this.camelToSnake(key)} = ?`)
      .join(', ');
    
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    await this.pool!.execute(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
    
    const [rows] = await this.pool!.execute('SELECT * FROM products WHERE id = ?', [id]) as any[];
    return rows[0] ? this.transformProduct(rows[0]) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const [result] = await this.pool!.execute('DELETE FROM products WHERE id = ?', [id]) as mysql.ResultSetHeader[];
    return result.affectedRows > 0;
  }

  // Order operations
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const [result] = await this.pool!.execute(
      'INSERT INTO orders (customer_id, items, total_amount, status, shipping_address, order_date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        orderData.customerId,
        JSON.stringify(orderData.items),
        orderData.totalAmount,
        orderData.status || 'pending',
        JSON.stringify(orderData.shippingAddress),
        orderData.orderDate || new Date()
      ]
    ) as mysql.ResultSetHeader[];

    const [rows] = await this.pool!.execute('SELECT * FROM orders WHERE id = ?', [result.insertId]) as any[];
    return this.transformOrder(rows[0]);
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

    query += ' ORDER BY order_date DESC';

    const [rows] = await this.pool!.execute(query, params) as any[];
    return rows.map((row: any) => this.transformOrder(row));
  }

  async findOrderById(id: string): Promise<Order | null> {
    const [rows] = await this.pool!.execute('SELECT * FROM orders WHERE id = ?', [id]) as any[];
    return rows[0] ? this.transformOrder(rows[0]) : null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${this.camelToSnake(key)} = ?`)
      .join(', ');
    
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    await this.pool!.execute(`UPDATE orders SET ${setClause} WHERE id = ?`, [...values, id]);
    
    const [rows] = await this.pool!.execute('SELECT * FROM orders WHERE id = ?', [id]) as any[];
    return rows[0] ? this.transformOrder(rows[0]) : null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const [result] = await this.pool!.execute('DELETE FROM orders WHERE id = ?', [id]) as mysql.ResultSetHeader[];
    return result.affectedRows > 0;
  }

  // Cart operations
  async findCart(userId: string): Promise<Cart | null> {
    const [rows] = await this.pool!.execute('SELECT * FROM carts WHERE customer_id = ?', [userId]) as any[];
    return rows[0] ? this.transformCart(rows[0]) : null;
  }

  async updateCart(userId: string, cartData: Partial<Cart>): Promise<Cart> {
    await this.pool!.execute(
      `INSERT INTO carts (customer_id, items) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE items = VALUES(items), updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(cartData.items || [])]
    );

    const [rows] = await this.pool!.execute('SELECT * FROM carts WHERE customer_id = ?', [userId]) as any[];
    return this.transformCart(rows[0]);
  }

  async clearCart(userId: string): Promise<boolean> {
    const [result] = await this.pool!.execute('DELETE FROM carts WHERE customer_id = ?', [userId]) as mysql.ResultSetHeader[];
    return result.affectedRows > 0;
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
      profile: typeof row.profile === 'string' ? JSON.parse(row.profile) : row.profile,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private transformProduct(row: any): Product {
    return {
      id: row.id.toString(),
      name: row.name,
      category: row.category,
      price: parseFloat(row.price),
      sku: row.sku,
      farmerId: row.farmer_id.toString(),
      stock: row.stock,
      description: row.description,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private transformOrder(row: any): Order {
    return {
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      orderDate: row.order_date,
      deliveryDate: row.delivery_date
    };
  }

  private transformCart(row: any): Cart {
    return {
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      updatedAt: row.updated_at
    };
  }
}
