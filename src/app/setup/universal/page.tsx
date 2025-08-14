'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Utensils, 
  ShoppingCart, 
  Factory, 
  Heart, 
  HardHat, 
  GraduationCap, 
  Briefcase,
  Truck,
  Scissors,
  Tractor,
  ChevronRight,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Users,
  Settings,
  CheckCircle2,
  BarChart3,
  Plus
} from 'lucide-react';

// User Roles
interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  permissions: string[];
  dashboardFeatures: string[];
}

// Industry Types
interface Industry {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  modules: string[];
  aiFeatures: string[];
  popularWith: string;
}

// AI Features
interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

export default function UniversalERPSetup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedAIFeatures, setSelectedAIFeatures] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [newCustomFeature, setNewCustomFeature] = useState('');
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    size: '',
    location: '',
    description: ''
  });

  // Industry Templates
  const industries: Industry[] = [
    {
      id: 'agriculture',
      name: 'Agriculture & Farming',
      description: 'Crop management, livestock tracking, equipment monitoring',
      icon: <Tractor className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-600',
      modules: ['Crop Management', 'Livestock Tracking', 'Equipment Management', 'Weather Integration', 'Harvest Planning'],
      aiFeatures: ['Crop Yield Prediction', 'Weather-based Recommendations', 'Pest Detection', 'Optimal Planting Times'],
      popularWith: '10,000+ farms worldwide'
    },
    {
      id: 'restaurant',
      name: 'Restaurant & Food Service',
      description: 'Menu management, inventory control, staff scheduling',
      icon: <Utensils className="h-8 w-8" />,
      color: 'from-orange-500 to-red-600',
      modules: ['Menu Management', 'Kitchen Operations', 'Table Management', 'Staff Scheduling', 'Recipe Costing'],
      aiFeatures: ['Demand Forecasting', 'Menu Optimization', 'Customer Preference Analysis', 'Inventory Auto-ordering'],
      popularWith: '5,000+ restaurants globally'
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      description: 'Product catalog, sales tracking, customer management',
      icon: <ShoppingCart className="h-8 w-8" />,
      color: 'from-blue-500 to-indigo-600',
      modules: ['Product Catalog', 'Point of Sale', 'Customer Management', 'Supplier Relations', 'Marketing Campaigns'],
      aiFeatures: ['Sales Prediction', 'Customer Behavior Analysis', 'Dynamic Pricing', 'Inventory Optimization'],
      popularWith: '15,000+ retailers trust us'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Production',
      description: 'Production planning, quality control, supply chain',
      icon: <Factory className="h-8 w-8" />,
      color: 'from-gray-500 to-slate-600',
      modules: ['Production Planning', 'Quality Control', 'Supply Chain', 'Equipment Maintenance', 'Workflow Management'],
      aiFeatures: ['Production Optimization', 'Quality Prediction', 'Maintenance Scheduling', 'Supply Chain Analytics'],
      popularWith: '3,000+ manufacturers'
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Medical',
      description: 'Patient management, appointments, billing, inventory',
      icon: <Heart className="h-8 w-8" />,
      color: 'from-pink-500 to-rose-600',
      modules: ['Patient Management', 'Appointment Scheduling', 'Medical Billing', 'Medical Records', 'Staff Management'],
      aiFeatures: ['Appointment Optimization', 'Patient Risk Assessment', 'Billing Automation', 'Resource Planning'],
      popularWith: '2,000+ healthcare providers'
    },
    {
      id: 'construction',
      name: 'Construction & Engineering',
      description: 'Project management, materials, equipment, workers',
      icon: <HardHat className="h-8 w-8" />,
      color: 'from-yellow-500 to-orange-600',
      modules: ['Project Management', 'Material Tracking', 'Equipment Management', 'Worker Scheduling', 'Cost Estimation'],
      aiFeatures: ['Project Timeline Optimization', 'Cost Prediction', 'Resource Allocation', 'Risk Assessment'],
      popularWith: '1,500+ construction companies'
    },
    {
      id: 'education',
      name: 'Education & Training',
      description: 'Student management, courses, staff, facilities',
      icon: <GraduationCap className="h-8 w-8" />,
      color: 'from-purple-500 to-violet-600',
      modules: ['Student Management', 'Course Planning', 'Faculty Management', 'Facility Booking', 'Academic Analytics'],
      aiFeatures: ['Student Performance Prediction', 'Course Recommendations', 'Resource Optimization', 'Attendance Insights'],
      popularWith: '800+ educational institutions'
    },
    {
      id: 'services',
      name: 'Professional Services',
      description: 'Client management, projects, billing, resources',
      icon: <Briefcase className="h-8 w-8" />,
      color: 'from-teal-500 to-cyan-600',
      modules: ['Client Management', 'Project Tracking', 'Time Billing', 'Resource Planning', 'Financial Reporting'],
      aiFeatures: ['Project Success Prediction', 'Resource Optimization', 'Client Satisfaction Analysis', 'Pricing Optimization'],
      popularWith: '4,000+ service providers'
    },
    {
      id: 'logistics',
      name: 'Logistics & Transportation',
      description: 'Fleet management, routes, deliveries, tracking',
      icon: <Truck className="h-8 w-8" />,
      color: 'from-indigo-500 to-blue-600',
      modules: ['Fleet Management', 'Route Optimization', 'Delivery Tracking', 'Driver Management', 'Fuel Management'],
      aiFeatures: ['Route Optimization', 'Delivery Prediction', 'Fleet Maintenance Scheduling', 'Fuel Consumption Analysis'],
      popularWith: '1,200+ logistics companies'
    },
    {
      id: 'beauty',
      name: 'Beauty & Wellness',
      description: 'Appointments, inventory, staff, client management',
      icon: <Scissors className="h-8 w-8" />,
      color: 'from-rose-500 to-pink-600',
      modules: ['Appointment Booking', 'Service Management', 'Staff Scheduling', 'Client Management', 'Product Tracking'],
      aiFeatures: ['Appointment Optimization', 'Client Preference Analysis', 'Inventory Prediction', 'Staff Performance Insights'],
      popularWith: '2,500+ salons & spas'
    }
  ];

  // User Roles Available
  const userRoles: UserRole[] = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access, user management, analytics, reports',
      icon: <Settings className="h-8 w-8" />,
      color: 'from-red-500 to-red-600',
      permissions: ['manage_users', 'view_analytics', 'system_settings', 'all_data_access'],
      dashboardFeatures: ['User Management', 'System Analytics', 'Financial Reports', 'System Settings', 'Activity Logs']
    },
    {
      id: 'manager',
      name: 'Manager/Owner',
      description: 'Business oversight, team management, performance analytics',
      icon: <Briefcase className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',  
      permissions: ['team_management', 'view_reports', 'approve_orders', 'manage_inventory'],
      dashboardFeatures: ['Team Dashboard', 'Performance Analytics', 'Approval Queue', 'Business Reports', 'Resource Planning']
    },
    {
      id: 'employee',
      name: 'Employee/Staff',
      description: 'Daily operations, task management, basic reporting',
      icon: <Users className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      permissions: ['view_tasks', 'update_status', 'basic_reports', 'own_data_access'],
      dashboardFeatures: ['Task Management', 'Daily Operations', 'Time Tracking', 'Personal Reports', 'Team Communication']
    },
    {
      id: 'customer',
      name: 'Customer/Client',
      description: 'Order placement, account management, support requests',
      icon: <Users className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      permissions: ['place_orders', 'view_orders', 'manage_profile', 'contact_support'],
      dashboardFeatures: ['Order Management', 'Account Settings', 'Order History', 'Support Center', 'Wishlist']
    },
    {
      id: 'vendor',
      name: 'Vendor/Supplier',
      description: 'Product management, order fulfillment, inventory updates',
      icon: <Truck className="h-8 w-8" />,
      color: 'from-orange-500 to-orange-600',
      permissions: ['manage_products', 'view_orders', 'update_inventory', 'shipping_management'],
      dashboardFeatures: ['Product Catalog', 'Order Queue', 'Inventory Management', 'Shipping Dashboard', 'Analytics']
    },
    {
      id: 'analyst',
      name: 'Data Analyst',
      description: 'Data analysis, reporting, business intelligence',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'from-indigo-500 to-indigo-600',
      permissions: ['view_all_data', 'create_reports', 'data_export', 'advanced_analytics'],
      dashboardFeatures: ['Data Visualization', 'Custom Reports', 'Trend Analysis', 'Predictive Analytics', 'Export Tools']
    }
  ];

  // AI Features Available
  const aiFeatures: AIFeature[] = [
    {
      id: 'predictive-analytics',
      name: 'Predictive Analytics',
      description: 'AI predicts future trends, sales, and business outcomes',
      icon: <TrendingUp className="h-5 w-5" />,
      available: true
    },
    {
      id: 'smart-automation',
      name: 'Smart Automation',
      description: 'Automate repetitive tasks with intelligent workflows',
      icon: <Zap className="h-5 w-5" />,
      available: true
    },
    {
      id: 'ai-assistant',
      name: 'AI Business Assistant',
      description: 'Natural language queries and voice commands',
      icon: <Brain className="h-5 w-5" />,
      available: true
    },
    {
      id: 'customer-insights',
      name: 'Customer Intelligence',
      description: 'Deep insights into customer behavior and preferences',
      icon: <Users className="h-5 w-5" />,
      available: true
    },
    {
      id: 'smart-recommendations',
      name: 'Smart Recommendations',
      description: 'AI-powered business recommendations and optimizations',
      icon: <Sparkles className="h-5 w-5" />,
      available: false // Premium feature
    }
  ];

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    setCurrentStep(2);
  };

  const addCustomFeature = () => {
    if (newCustomFeature.trim() && !customFeatures.includes(newCustomFeature.trim())) {
      setCustomFeatures([...customFeatures, newCustomFeature.trim()]);
      setNewCustomFeature('');
    }
  };

  const removeCustomFeature = (feature: string) => {
    setCustomFeatures(customFeatures.filter(f => f !== feature));
  };

  const handleSetupComplete = async () => {
    try {
      console.log('Starting setup completion...');
      
      if (!selectedIndustry) {
        alert('Please select an industry first');
        return;
      }

      if (!selectedRole) {
        alert('Please select a role first');
        return;
      }

      console.log('Selected industry:', selectedIndustry);
      console.log('Selected role:', selectedRole);

      // Save configuration to database/localStorage (without circular references)
      const config = {
        industry: {
          id: selectedIndustry.id,
          name: selectedIndustry.name,
          color: selectedIndustry.color,
          modules: selectedIndustry.modules || [],
          aiFeatures: selectedIndustry.aiFeatures || [],
          colorScheme: selectedIndustry.color
        },
        role: {
          id: selectedRole.id,
          name: selectedRole.name,
          color: selectedRole.color,
          permissions: selectedRole.permissions || [],
          dashboardFeatures: selectedRole.dashboardFeatures || []
        },
        aiFeatures: selectedAIFeatures,
        customFeatures: customFeatures,
        businessInfo,
        setupDate: new Date().toISOString()
      };
      
      console.log('Config to save:', config);
      
      // Test JSON stringification before saving
      const configString = JSON.stringify(config);
      localStorage.setItem('erp_config', configString);
      
      console.log('Configuration saved to localStorage');
      console.log('Attempting to redirect to /erp...');
      
      // Use router.replace for cleaner navigation
      router.replace('/erp');
      
      console.log('Router.replace initiated');
    } catch (error) {
      console.error('Setup completion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error saving configuration: ${errorMessage}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Universal AI-Powered ERP
              </h1>
              <p className="text-gray-600 mt-1">Configure your business management system in minutes</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <ChevronRight className="h-4 w-4" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <ChevronRight className="h-4 w-4" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <ChevronRight className="h-4 w-4" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Industry Selection */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Industry</h2>
              <p className="text-gray-600 text-lg">Select your business type to get started with pre-configured modules and AI features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {industries.map((industry) => (
                <div
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry)}
                  className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${industry.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {industry.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{industry.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{industry.description}</p>
                  <div className="text-xs text-blue-600 font-semibold">{industry.popularWith}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Role</h2>
              <p className="text-gray-600 text-lg">Select your role to customize the dashboard and features for your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setCurrentStep(3);
                  }}
                  className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {role.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{role.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                  
                  {/* Role Features Preview */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Dashboard Features:</h4>
                    {role.dashboardFeatures.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {role.dashboardFeatures.length > 3 && (
                      <div className="text-xs text-blue-600 font-medium">+{role.dashboardFeatures.length - 3} more features</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Back to Industry Selection
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Features Selection */}
        {currentStep === 3 && selectedIndustry && selectedRole && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Configure AI Features</h2>
              <p className="text-gray-600 text-lg">Choose AI-powered features for your {selectedIndustry.name} business as a {selectedRole.name}</p>
            </div>

            {/* Selected Industry & Role Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Industry Card */}
              <div className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedIndustry.color} flex items-center justify-center text-white`}>
                    {selectedIndustry.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedIndustry.name}</h3>
                    <p className="text-gray-600">Industry Focus</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Included Modules:</h4>
                  <div className="space-y-1">
                    {selectedIndustry.modules.slice(0, 3).map((module, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{module}</span>
                      </div>
                    ))}
                    {selectedIndustry.modules.length > 3 && (
                      <div className="text-sm text-blue-600 font-medium">+{selectedIndustry.modules.length - 3} more modules</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Card */}
              <div className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedRole.color} flex items-center justify-center text-white`}>
                    {selectedRole.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedRole.name}</h3>
                    <p className="text-gray-600">Your Role</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Dashboard Features:</h4>
                  <div className="space-y-1">
                    {selectedRole.dashboardFeatures.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {selectedRole.dashboardFeatures.length > 3 && (
                      <div className="text-sm text-blue-600 font-medium">+{selectedRole.dashboardFeatures.length - 3} more features</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {aiFeatures.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => {
                    if (feature.available) {
                      setSelectedAIFeatures(prev => 
                        prev.includes(feature.id) 
                          ? prev.filter(id => id !== feature.id)
                          : [...prev, feature.id]
                      );
                    }
                  }}
                  className={`bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 ${
                    feature.available 
                      ? 'cursor-pointer hover:shadow-xl hover:scale-105' 
                      : 'opacity-50 cursor-not-allowed'
                  } ${
                    selectedAIFeatures.includes(feature.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      selectedAIFeatures.includes(feature.id) 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {feature.icon}
                    </div>
                    {!feature.available && (
                      <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        Premium
                      </div>
                    )}
                    {selectedAIFeatures.includes(feature.id) && (
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.name}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Custom Features Input */}
            <div className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Custom Features</h3>
              <p className="text-gray-600 mb-4">Want something specific for your business? Add custom features that will be included in your dashboard.</p>
              
              {/* Input for new custom feature */}
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  value={newCustomFeature}
                  onChange={(e) => setNewCustomFeature(e.target.value)}
                  placeholder="e.g., Customer Loyalty Program, Equipment Maintenance Tracker..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomFeature();
                    }
                  }}
                />
                <button
                  onClick={addCustomFeature}
                  disabled={!newCustomFeature.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Display added custom features */}
              {customFeatures.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Your Custom Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {customFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        <span>{feature}</span>
                        <button
                          onClick={() => removeCustomFeature(feature)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Back to Role Selection
              </button>
              <button 
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Continue to Business Info
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Business Information */}
        {currentStep === 4 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Business Information</h2>
              <p className="text-gray-600 text-lg">Tell us about your business to complete the setup</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white/90 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={businessInfo.name}
                      onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Size</label>
                    <select
                      value={businessInfo.size}
                      onChange={(e) => setBusinessInfo({...businessInfo, size: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select business size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={businessInfo.location}
                      onChange={(e) => setBusinessInfo({...businessInfo, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                    <textarea
                      value={businessInfo.description}
                      onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Briefly describe your business"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Back to AI Features
                  </button>
                  <button 
                    onClick={handleSetupComplete}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    Complete Setup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
