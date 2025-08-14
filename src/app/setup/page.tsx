'use client';

import { useState } from 'react';
import { Database, CheckCircle, XCircle, ExternalLink, Copy, Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function DatabaseSetup() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setTestResult(null);

    try {
      const response = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'sqlite',
          connectionString: './database/farm_ecommerce.db'
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        toast.success('Database connected successfully!');
      } else {
        setConnectionStatus('error');
        toast.error('Connection failed - check your configuration');
      }
      
      setTestResult(result);
    } catch (error) {
      setConnectionStatus('error');
      setTestResult({ success: false, message: 'Network error' });
      toast.error('Failed to test connection');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const seedDatabase = async () => {
    if (connectionStatus !== 'success') {
      toast.error('Please establish database connection first');
      return;
    }

    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Database seeded successfully!');
        // Redirect to main app
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to seed database');
      }
    } catch (error) {
      toast.error('Failed to seed database');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-xl">
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
          <p className="text-gray-500">Configure your database for the Farm E-commerce Platform</p>
        </div>

        {/* Connection Test Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Database Connection Test</h2>
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {connectionStatus === 'testing' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </span>
              </div>
              
              {testResult.success && (
                <div className="text-sm text-green-700">
                  <p>Database: {testResult.database}</p>
                  <p>Connected at: {new Date(testResult.timestamp).toLocaleString()}</p>
                </div>
              )}

              {!testResult.success && testResult.help && (
                <div className="mt-3 text-sm text-red-700">
                  <p className="font-medium mb-2">Troubleshooting steps:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{testResult.help.step1}</li>
                    <li>{testResult.help.step2}</li>
                    <li>{testResult.help.step3}</li>
                    <li>{testResult.help.step4}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 1: Create MongoDB Atlas Account</h3>
              <p className="text-gray-600 mb-2">Sign up for a free MongoDB Atlas account</p>
              <a 
                href="https://www.mongodb.com/cloud/atlas/register" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <span>Open MongoDB Atlas</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 2: Create Free Cluster</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Choose M0 Sandbox (FREE tier)</li>
                <li>• Name: "farm-ecommerce-cluster"</li>
                <li>• Select AWS and closest region</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 3: Database User & Network</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Create database user: "farmuser"</li>
                <li>• Generate strong password</li>
                <li>• Allow access from anywhere (0.0.0.0/0)</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-2">Step 4: Connection String</h3>
              <p className="text-gray-600 mb-2">Get your connection string and update .env.local:</p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div className="flex justify-between items-center">
                  <span>MONGODB_URI=mongodb+srv://farmuser:PASSWORD@cluster...</span>
                  <button
                    onClick={() => copyToClipboard('MONGODB_URI=mongodb+srv://farmuser:PASSWORD@farm-ecommerce-cluster.xxxxx.mongodb.net/farm_ecommerce?retryWrites=true&w=majority')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seed Database */}
        {connectionStatus === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Initialize Database</h2>
            <p className="text-gray-600 mb-4">
              Your database connection is working! Now let's populate it with initial data.
            </p>
            <button
              onClick={seedDatabase}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <Database className="h-5 w-5" />
              <span>Seed Database & Launch App</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
