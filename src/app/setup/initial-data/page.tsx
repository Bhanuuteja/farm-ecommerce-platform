'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InitialDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setStep(2);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        alert(`Failed to seed database: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Error seeding database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Skip Option */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">🌱 Initialize Your Farm Platform</h1>
            <p className="text-lg text-gray-600">
              Create your admin account and sample farm data
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
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="ml-2 text-green-600 font-medium">Database Setup</span>
            </div>
            <div className="w-8 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-green-600 font-medium">Initialize Data</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-gray-500">Login & Use</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Ready to Create Initial Data
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">👑 Admin Account</h3>
                  <p className="text-gray-600 text-sm">
                    Email: admin@farm.com<br/>
                    Password: admin123
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">🚜 Farmer Account</h3>
                  <p className="text-gray-600 text-sm">
                    Email: farmer@farm.com<br/>
                    Password: farmer123
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">👤 Customer Account</h3>
                  <p className="text-gray-600 text-sm">
                    Email: customer@farm.com<br/>
                    Password: customer123
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">📦 Sample Data Includes:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <ul className="space-y-2 text-gray-600">
                    <li>🥕 Fresh Vegetables (Carrots, Tomatoes, Lettuce)</li>
                    <li>🍎 Fresh Fruits (Apples, Bananas, Oranges)</li>
                    <li>🥛 Dairy Products (Milk, Cheese, Butter)</li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li>📱 Real-time notifications</li>
                    <li>🛒 Shopping cart functionality</li>
                    <li>📊 Order management system</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={seedDatabase}
                disabled={isLoading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Initial Data...
                  </div>
                ) : (
                  'Create Initial Data'
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                This will set up your farm e-commerce platform with sample data
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-semibold text-green-600 mb-4">
              Platform Initialized Successfully!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Your farm e-commerce platform is ready to use
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Login Credentials</h3>
              <div className="text-sm text-green-700">
                <p><strong>Admin:</strong> admin@farm.com / admin123</p>
                <p><strong>Farmer:</strong> farmer@farm.com / farmer123</p>
                <p><strong>Customer:</strong> customer@farm.com / customer123</p>
              </div>
            </div>

            <p className="text-gray-600">Redirecting to admin dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
