import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to test database connections',
    supportedDatabases: ['mongodb', 'postgresql', 'mysql', 'sqlite', 'turso']
  });
}

export async function POST(request: NextRequest) {
  try {
    const { type, connectionString } = await request.json();

    if (!type || !connectionString) {
      return NextResponse.json(
        { error: 'Database type and connection string are required' },
        { status: 400 }
      );
    }

    // Test SQLite connection (simplified)
    if (type === 'sqlite') {
      try {
        const sqlite3 = await import('sqlite3');
        const Database = sqlite3.default.Database;
        
        const dbPath = connectionString.replace('sqlite://', '');
        const dir = path.dirname(dbPath);
        await fs.mkdir(dir, { recursive: true });

        return new Promise((resolve) => {
          const db = new Database(dbPath, (err) => {
            if (err) {
              resolve(NextResponse.json({
                success: false,
                error: err.message || 'SQLite connection failed'
              }, { status: 500 }));
            } else {
              db.get('SELECT sqlite_version() as version', (err, row: any) => {
                db.close();
                if (err) {
                  resolve(NextResponse.json({
                    success: false,
                    error: err.message
                  }, { status: 500 }));
                } else {
                  // Update database config
                  updateDatabaseConfig(type, connectionString);
                  resolve(NextResponse.json({
                    success: true,
                    message: 'Database connection successful',
                    details: {
                      version: 'SQLite ' + row.version,
                      path: dbPath,
                      type: 'SQLite'
                    }
                  }));
                }
              });
            }
          });
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message || 'SQLite connection failed'
        }, { status: 500 });
      }
    }

    // For other database types, return a placeholder for now
    return NextResponse.json({
      success: false,
      error: `Database type ${type} not yet implemented in this simplified version`
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

async function updateDatabaseConfig(type: string, connectionString: string) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, create new content
    }

    if (envContent.includes('DATABASE_TYPE=')) {
      envContent = envContent.replace(/DATABASE_TYPE=.*/g, `DATABASE_TYPE=${type}`);
    } else {
      envContent += `\nDATABASE_TYPE=${type}`;
    }

    const timestamp = new Date().toISOString();
    const configComment = `\n\n# Database Configuration (Updated: ${timestamp})`;
    
    const configRegex = /\n\n# Database Configuration[\s\S]*$/;
    envContent = envContent.replace(configRegex, '');
    
    envContent += configComment;
    envContent += `\nDATABASE_TYPE=${type}`;
    
    if (type === 'sqlite') {
      envContent += `\nSQLITE_PATH=${connectionString}`;
    }

    await fs.writeFile(envPath, envContent);
    console.log(`✅ Database configuration updated: ${type}`);
    
  } catch (error) {
    console.error('❌ Failed to update database config:', error);
  }
}
