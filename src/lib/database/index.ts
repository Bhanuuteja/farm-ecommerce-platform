// Multi-Database Adapter System for Farm E-commerce Platform
export type { DatabaseAdapter, DatabaseConfig, User, Product, Order, Cart } from './types';
export { default as DatabaseFactory } from './factory';

// Re-export adapters for direct use if needed
export { MongoDBAdapter } from './adapters/mongodb';

// Types for better intellisense
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql' | 'sqlite' | 'turso';

// Helper function for quick setup
export async function createDatabase(type?: DatabaseType) {
  const { default: DatabaseFactory } = await import('./factory');
  return await DatabaseFactory.getAdapter();
}

// Database connection helper with retry logic
export async function connectWithRetry(maxRetries = 3, delay = 1000) {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const db = await createDatabase();
      console.log(`✅ Database connected successfully on attempt ${i + 1}`);
      return db;
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Database connection attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw new Error(`Failed to connect to database after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
