import { Pool, PoolClient } from 'pg';
import { DatabaseAdapter, DatabaseConfig, User, Product, Order, Cart } from '../types';

export class PostgreSQLAdapter implements DatabaseAdapter {
  private config: DatabaseConfig;
  private pool: Pool | null = null;
  private connected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      this.pool = new Pool({
        connectionString: this.config.connection.uri,
        max: this.config.options?.poolSize || 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: this.config.options?.timeout || 5000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const client = await this.pool.connect();
      await this.createTables(client);
      client.release();
      
      this.connected = true;
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
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

  private async createTables(client: PoolClient): Promise<void> {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'farmer', 'customer')),
        profile JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        farmer_id INTEGER NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        images JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
        shipping_address JSONB NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER UNIQUE NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
    `);

    // Create update timestamp function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    const tables = ['users', 'products', 'orders', 'carts'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at 
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (username, email, password, role, profile) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userData.username, userData.email, userData.password, userData.role, userData.profile || {}]
      );
      return this.transformUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findUserById(id: string): Promise<User | null> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] ? this.transformUser(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] ? this.transformUser(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const client = await this.pool!.connect();
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
        .join(', ');
      
      const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
      
      const result = await client.query(
        `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0] ? this.transformUser(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  // Product operations
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(
        `INSERT INTO products (name, category, price, sku, farmer_id, stock, description, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          productData.name,
          productData.category,
          productData.price,
          productData.sku,
          productData.farmerId,
          productData.stock || 0,
          productData.description,
          productData.images || []
        ]
      );
      return this.transformProduct(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findProducts(filter: any = {}): Promise<Product[]> {
    const client = await this.pool!.connect();
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filter.farmerId) {
        query += ` AND farmer_id = $${paramIndex}`;
        params.push(filter.farmerId);
        paramIndex++;
      }

      if (filter.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(filter.category);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, params);
      return result.rows.map(row => this.transformProduct(row));
    } finally {
      client.release();
    }
  }

  async findProductById(id: string): Promise<Product | null> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0] ? this.transformProduct(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const client = await this.pool!.connect();
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
        .join(', ');
      
      const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
      
      const result = await client.query(
        `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0] ? this.transformProduct(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  // Order operations
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(
        `INSERT INTO orders (customer_id, items, total_amount, status, shipping_address, order_date) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          orderData.customerId,
          JSON.stringify(orderData.items),
          orderData.totalAmount,
          orderData.status || 'pending',
          JSON.stringify(orderData.shippingAddress),
          orderData.orderDate || new Date()
        ]
      );
      return this.transformOrder(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findOrders(filter: any = {}): Promise<Order[]> {
    const client = await this.pool!.connect();
    try {
      let query = 'SELECT * FROM orders WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filter.customerId) {
        query += ` AND customer_id = $${paramIndex}`;
        params.push(filter.customerId);
        paramIndex++;
      }

      if (filter.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filter.status);
        paramIndex++;
      }

      query += ' ORDER BY order_date DESC';

      const result = await client.query(query, params);
      return result.rows.map(row => this.transformOrder(row));
    } finally {
      client.release();
    }
  }

  async findOrderById(id: string): Promise<Order | null> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
      return result.rows[0] ? this.transformOrder(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const client = await this.pool!.connect();
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
        .join(', ');
      
      const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
      
      const result = await client.query(
        `UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0] ? this.transformOrder(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('DELETE FROM orders WHERE id = $1', [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  // Cart operations
  async findCart(userId: string): Promise<Cart | null> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('SELECT * FROM carts WHERE customer_id = $1', [userId]);
      return result.rows[0] ? this.transformCart(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateCart(userId: string, cartData: Partial<Cart>): Promise<Cart> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(
        `INSERT INTO carts (customer_id, items) 
         VALUES ($1, $2) 
         ON CONFLICT (customer_id) 
         DO UPDATE SET items = $2, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, JSON.stringify(cartData.items || [])]
      );
      return this.transformCart(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query('DELETE FROM carts WHERE customer_id = $1', [userId]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  // Utility functions
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private transformUser(row: any): User {
    return {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      profile: row.profile || {},
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
      images: row.images || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private transformOrder(row: any): Order {
    return {
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: row.items || [],
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      shippingAddress: row.shipping_address,
      orderDate: row.order_date,
      deliveryDate: row.delivery_date
    };
  }

  private transformCart(row: any): Cart {
    return {
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      items: row.items || [],
      updatedAt: row.updated_at
    };
  }
}
