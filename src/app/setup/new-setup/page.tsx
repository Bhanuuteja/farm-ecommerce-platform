'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, CheckCircle, Settings, Users, Zap } from 'lucide-react';

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [dbConfig, setDbConfig] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if database is already configured
    const savedConfig = localStorage.getItem('farm_db_config');
    if (savedConfig) {
      setDbConfig(JSON.parse(savedConfig));
      setCurrentStep(2);
    }
  }, []);

  const steps = [
    {
      id: 1,
      title: 'Database Setup',
      description: 'Choose and configure your database',
      icon: Database,
      path: '/setup/database'
    },
    {
      id: 2,
      title: 'Initial Data',
      description: 'Create admin account and sample data',
      icon: Users,
      action: 'seed'
    },
    {
      id: 3,
      title: 'Real-time Features',
      description: 'Configure Kafka and notifications',
      icon: Zap,
      path: '/setup/realtime'
    },
    {
      id: 4,
      title: 'Complete',
      description: 'Your platform is ready!',
      icon: CheckCircle,
      path: '/admin'
    }
  ];

  const handleStepAction = async (step: any) => {
    if (step.path) {
      router.push(step.path);
    } else if (step.action === 'seed') {
      await seedDatabase();
    }
  };

  const seedDatabase = async () => {
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setCurrentStep(3);
      } else {
        alert('Failed to seed database');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Error seeding database');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              🌾 Farm E-commerce Platform
            </h1>
            <p className="text-xl text-gray-600">
              Multi-database, real-time farm e-commerce platform
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isDisabled = currentStep < step.id;

              return (
                <div
                  key={step.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-50 border-green-500'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-500 shadow-lg'
                      : isDisabled
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>

                    {isCurrent && (
                      <button
                        onClick={() => handleStepAction(step)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {step.id === 1 ? 'Choose Database' : 
                         step.id === 2 ? 'Create Data' :
                         step.id === 3 ? 'Setup Kafka' : 'Launch'}
                      </button>
                    )}

                    {isCompleted && (
                      <div className="text-green-600 font-medium">
                        ✓ Complete
                      </div>
                    )}
                  </div>

                  {/* Database Config Display */}
                  {step.id === 1 && dbConfig && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="text-sm text-green-800">
                        <strong>Database:</strong> {dbConfig.type.toUpperCase()}
                      </div>
                      <div className="text-xs text-green-600">
                        Configured: {new Date(dbConfig.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">🗄️ Multi-Database</h3>
              <p className="text-gray-600 text-sm">
                MongoDB, PostgreSQL, MySQL, SQLite, or Turso - your choice
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">⚡ Real-time</h3>
              <p className="text-gray-600 text-sm">
                Kafka + Socket.IO for instant notifications and updates
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">👥 Role-based</h3>
              <p className="text-gray-600 text-sm">
                Admin, Farmer, and Customer roles with specific permissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
