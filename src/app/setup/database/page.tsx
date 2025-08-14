'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DatabaseOption {
  type: string;
  name: string;
  description: string;
  features: string[];
  setup: string;
  free: boolean;
  storage: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const databases: DatabaseOption[] = [
  {
    type: 'mongodb',
    name: 'MongoDB Atlas',
    description: 'Document database with flexible schema',
    features: ['Document Store', 'Flexible Schema', 'Built-in Scaling', 'Cloud Managed'],
    setup: 'Atlas Free Tier or Local Install',
    free: true,
    storage: '512MB Free',
    difficulty: 'Easy'
  },
  {
    type: 'postgresql',
    name: 'PostgreSQL (Supabase)',
    description: 'Powerful relational database with JSON support',
    features: ['SQL Compliant', 'JSONB Support', 'Full-text Search', 'Real-time'],
    setup: 'Supabase Free Tier',
    free: true,
    storage: '500MB Free',
    difficulty: 'Easy'
  },
  {
    type: 'mysql',
    name: 'MySQL (PlanetScale)',
    description: 'Popular relational database with branching',
    features: ['MySQL Compatible', 'Database Branching', 'Serverless', 'Auto-scaling'],
    setup: 'PlanetScale Free Tier',
    free: true,
    storage: '5GB Free',
    difficulty: 'Easy'
  },
  {
    type: 'sqlite',
    name: 'SQLite (Local)',
    description: 'Lightweight file-based database',
    features: ['No Server', 'Single File', 'Zero Config', 'Fast Local'],
    setup: 'Built-in with Node.js',
    free: true,
    storage: 'Unlimited Local',
    difficulty: 'Easy'
  },
  {
    type: 'turso',
    name: 'Turso (LibSQL)',
    description: 'Edge database with global distribution',
    features: ['Edge Deployment', 'SQLite Compatible', 'Global Replication', 'Low Latency'],
    setup: 'Turso Cloud',
    free: true,
    storage: '9GB Free',
    difficulty: 'Medium'
  }
];

export default function DatabaseSetup() {
  const [selectedDb, setSelectedDb] = useState<string>('mongodb');
  const [connectionString, setConnectionString] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  const selectedDatabase = databases.find(db => db.type === selectedDb);

  const getDefaultConnectionString = (type: string) => {
    const defaults: Record<string, string> = {
      mongodb: 'mongodb://localhost:27017/farm_ecommerce',
      postgresql: 'postgresql://user:password@localhost:5432/farm_ecommerce',
      mysql: 'mysql://user:password@localhost:3306/farm_ecommerce',
      sqlite: './database/farm_ecommerce.db',
      turso: 'libsql://your-db.turso.io'
    };
    return defaults[type] || '';
  };

  useEffect(() => {
    setConnectionString(getDefaultConnectionString(selectedDb));
  }, [selectedDb]);

  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedDb,
          connectionString,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setConnectionStatus('success');
        
        // Save configuration to localStorage
        localStorage.setItem('farm_db_config', JSON.stringify({
          type: selectedDb,
          connectionString,
          lastUpdated: new Date().toISOString()
        }));

        // Redirect to appropriate dashboard after success
        setTimeout(() => {
          router.push('/setup/initial-data');
        }, 2000);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Network error: Unable to test connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Skip Option */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">🌾 Choose Your Database</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the database that best fits your needs. All options are free to start with!
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Skip to Login
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-green-600 font-medium">Database Setup</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-gray-500">Initialize Data</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-gray-500">Login & Use</span>
            </div>
          </div>
        </div>

        {/* Database Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {databases.map((db) => (
            <div
              key={db.type}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedDb === db.type
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
              onClick={() => setSelectedDb(db.type)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{db.name}</h3>
                <div className="flex items-center gap-2">
                  {db.free && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      FREE
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(db.difficulty)}`}>
                    {db.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{db.description}</p>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-700">
                  <strong>Storage:</strong> {db.storage}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Setup:</strong> {db.setup}
                </div>
              </div>

              <div className="space-y-1">
                {db.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              {selectedDb === db.type && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Connection Configuration */}
        {selectedDatabase && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Configure {selectedDatabase.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection String
                </label>
                <input
                  type="text"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder={getDefaultConnectionString(selectedDb)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDb === 'sqlite' 
                    ? 'File path for your SQLite database' 
                    : 'Your database connection URL'
                  }
                </p>
              </div>

              {/* Setup Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Quick Setup Instructions:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  {selectedDb === 'mongodb' && (
                    <div>
                      <p>1. Sign up at <a href="https://www.mongodb.com/atlas" target="_blank" className="underline">MongoDB Atlas</a></p>
                      <p>2. Create a free cluster</p>
                      <p>3. Get your connection string and replace &lt;password&gt; with your password</p>
                    </div>
                  )}
                  {selectedDb === 'postgresql' && (
                    <div>
                      <p>1. Sign up at <a href="https://supabase.com" target="_blank" className="underline">Supabase</a></p>
                      <p>2. Create a new project</p>
                      <p>3. Copy the PostgreSQL connection string from Settings → Database</p>
                    </div>
                  )}
                  {selectedDb === 'mysql' && (
                    <div>
                      <p>1. Sign up at <a href="https://planetscale.com" target="_blank" className="underline">PlanetScale</a></p>
                      <p>2. Create a new database</p>
                      <p>3. Copy the connection string from the Connect modal</p>
                    </div>
                  )}
                  {selectedDb === 'sqlite' && (
                    <div>
                      <p>1. No signup required! SQLite runs locally</p>
                      <p>2. The database file will be created automatically</p>
                      <p>3. Perfect for development and testing</p>
                    </div>
                  )}
                  {selectedDb === 'turso' && (
                    <div>
                      <p>1. Sign up at <a href="https://turso.tech" target="_blank" className="underline">Turso</a></p>
                      <p>2. Create a new database</p>
                      <p>3. Copy the database URL and auth token</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              {connectionStatus !== 'idle' && (
                <div className={`p-4 rounded-lg ${
                  connectionStatus === 'success' ? 'bg-green-50 border border-green-200' :
                  connectionStatus === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  {connectionStatus === 'connecting' && (
                    <div className="flex items-center text-yellow-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700 mr-2"></div>
                      Testing connection...
                    </div>
                  )}
                  {connectionStatus === 'success' && (
                    <div className="text-green-700">
                      <div className="flex items-center">
                        <span className="mr-2">✅</span>
                        Connection successful! Redirecting to setup...
                      </div>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="text-red-700">
                      <div className="flex items-center">
                        <span className="mr-2">❌</span>
                        Connection failed: {errorMessage}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test Connection Button */}
              <div className="flex gap-4">
                <button
                  onClick={testConnection}
                  disabled={isConnecting || !connectionString.trim()}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isConnecting ? 'Testing Connection...' : 'Test & Save Connection'}
                </button>
                
                <button
                  onClick={() => router.push('/setup/initial-data')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Package Installation Instructions */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📦 Required Packages</h3>
          <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="mb-2 text-gray-300"># Install required packages for {selectedDatabase?.name}:</div>
            {selectedDb === 'mongodb' && <div>npm install mongoose</div>}
            {selectedDb === 'postgresql' && <div>npm install pg @types/pg</div>}
            {selectedDb === 'mysql' && <div>npm install mysql2</div>}
            {selectedDb === 'sqlite' && <div>npm install sqlite3 @types/sqlite3</div>}
            {selectedDb === 'turso' && <div>npm install @libsql/client</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
