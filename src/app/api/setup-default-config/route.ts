import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create a default ERP configuration for farm e-commerce
    const defaultConfig = {
      industry: {
        id: 'agriculture',
        name: 'Farm E-commerce',
        color: 'from-green-500 to-emerald-600',
        colorScheme: 'from-green-500 to-emerald-600',
        modules: [
          'Sales & Orders',
          'Inventory Management', 
          'Customer Management',
          'Product Catalog',
          'Analytics & Reports',
          'Supply Chain'
        ],
        aiFeatures: [
          'Demand Forecasting',
          'Crop Optimization',
          'Market Price Analysis',
          'Customer Insights',
          'Inventory Optimization'
        ]
      },
      role: {
        id: 'admin',
        name: 'System Administrator',
        color: 'from-blue-500 to-indigo-600',
        permissions: [
          'user_management',
          'system_settings',
          'financial_reports',
          'data_export',
          'api_access'
        ],
        dashboardFeatures: [
          'Real-time Analytics',
          'System Health Monitor',
          'User Activity Logs',
          'Revenue Tracking',
          'Performance Metrics'
        ]
      },
      aiFeatures: [
        'Smart Inventory Management',
        'Customer Behavior Analysis',
        'Revenue Optimization',
        'Market Trend Analysis'
      ],
      businessInfo: {
        name: 'Farm Fresh E-commerce',
        size: 'Medium Business',
        location: 'Agricultural Region',
        description: 'Farm-to-table e-commerce platform connecting farmers with consumers'
      },
      setupDate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Default ERP configuration created',
      config: defaultConfig
    });

  } catch (error: any) {
    console.error('Error creating default config:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create default configuration',
      error: error.message
    }, { status: 500 });
  }
}
