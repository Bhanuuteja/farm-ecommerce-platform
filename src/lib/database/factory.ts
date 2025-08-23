import { DatabaseAdapter, DatabaseConfig } from './types';

class DatabaseFactory {
  private static instance: DatabaseAdapter | null = null;

  static async createAdapter(config: DatabaseConfig): Promise<DatabaseAdapter> {
    if (this.instance) {
      return this.instance;
    }

    let adapter: DatabaseAdapter;

    switch (config.type) {
      case 'mongodb':
        const { MongoDBAdapter } = await import('./adapters/mongodb');
        adapter = new MongoDBAdapter(config);
        break;
        
      case 'postgresql':
        const { PostgreSQLAdapter } = await import('./adapters/postgresql');
        adapter = new PostgreSQLAdapter(config);
        break;
        
      case 'mysql':
        const { MySQLAdapter } = await import('./adapters/mysql');
        adapter = new MySQLAdapter(config);
        break;
        
      case 'sqlite':
        const { SQLiteAdapter } = await import('./adapters/sqlite');
        adapter = new SQLiteAdapter(config);
        break;
        
      case 'turso':
        const { TursoAdapter } = await import('./adapters/turso');
        adapter = new TursoAdapter(config);
        break;
        
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }

    await adapter.connect();
    this.instance = adapter;
    return adapter;
  }

  static async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.instance) {
      const config = this.getConfigFromEnv();
      return await this.createAdapter(config);
    }
    return this.instance;
  }

  private static getConfigFromEnv(): DatabaseConfig {
    // Log environment variables for debugging
    console.log('Environment check:', {
      DATABASE_TYPE: process.env.DATABASE_TYPE,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    });
    
    const dbType = (process.env.DATABASE_TYPE || 'sqlite') as DatabaseConfig['type'];
    console.log('Using database type:', dbType);
    
    const configs: Record<string, DatabaseConfig> = {
      mongodb: {
        type: 'mongodb',
        connection: {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_ecommerce'
        },
        options: {
          poolSize: 50,
          timeout: 1500,
          retryAttempts: 3
        }
      },
      
      postgresql: {
        type: 'postgresql',
        connection: {
          uri: process.env.POSTGRES_URL || process.env.DATABASE_URL
        },
        options: {
          poolSize: 20,
          timeout: 5000,
          retryAttempts: 3
        }
      },
      
      mysql: {
        type: 'mysql',
        connection: {
          uri: process.env.MYSQL_URL || process.env.DATABASE_URL
        },
        options: {
          poolSize: 20,
          timeout: 5000,
          retryAttempts: 3
        }
      },
      
      sqlite: {
        type: 'sqlite',
        connection: {
          // Use in-memory database for serverless environments like Vercel
          path: process.env.VERCEL ? ':memory:' : (process.env.SQLITE_PATH || './database/farm_ecommerce.db')
        },
        options: {
          timeout: 1000,
          retryAttempts: 3
        }
      },
      
      turso: {
        type: 'turso',
        connection: {
          uri: process.env.TURSO_DATABASE_URL,
          password: process.env.TURSO_AUTH_TOKEN
        },
        options: {
          timeout: 3000,
          retryAttempts: 3
        }
      }
    };

    const config = configs[dbType];
    if (!config) {
      throw new Error(`No configuration found for database type: ${dbType}`);
    }

    return config;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.disconnect();
      this.instance = null;
    }
  }
}

export default DatabaseFactory;
