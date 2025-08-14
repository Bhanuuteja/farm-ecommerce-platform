'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, Edit, Eye, EyeOff, Trash2, MoreVertical, UserPlus, Archive, Mail, Shield, Activity, Settings } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Extend the session type to include role
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  totalFarmers: number;
  totalCustomers: number;
  topFarmers: Array<{ name: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  monthlyData: Array<{ month: string; revenue: number; orders: number }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock_quantity: number;
  farmer_id: number;
  created_at: string;
  is_active?: boolean;
  description?: string;
}

interface Order {
  id: number;
  user_id: number;
  farmer_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  user_name?: string;
  farmer_name?: string;
}

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title }: { data: Array<{ month: string; revenue: number }>, title: string }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-700 w-12">{item.month}</span>
            <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full h-8 relative overflow-hidden border border-white/20">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-300 hover:from-emerald-400 hover:to-blue-500 shadow-lg"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              >
                <span className="text-xs text-white font-bold">
                  ${item.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon }: { title: string; value: string | number; change?: string; icon: string }) => (
  <div className="glass rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mt-1 group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-300">{value}</p>
        {change && (
          <p className="text-emerald-600 text-sm mt-1 font-semibold">{change}</p>
        )}
      </div>
      <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    </div>
  </div>
);

// Advanced Dropdown Action Component
const ActionDropdown = ({ 
  id, 
  actions, 
  isOpen, 
  onToggle, 
  dropdownRef 
}: { 
  id: string;
  actions: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: string;
    disabled?: boolean;
  }>;
  isOpen: boolean;
  onToggle: () => void;
  dropdownRef: (ref: HTMLDivElement | null) => void;
}) => (
  <div className="relative inline-block text-left" ref={dropdownRef}>
    <button
      onClick={onToggle}
      className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 glass hover:bg-white/50 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-lg border border-white/20"
      aria-label="Actions"
      type="button"
    >
      <MoreVertical className="w-4 h-4" />
    </button>
    {isOpen && (
      <div className="absolute right-0 z-50 mt-3 w-52 origin-top-right glass rounded-2xl shadow-2xl border border-white/20 focus:outline-none transform -translate-x-2 animate-scale-in">
        <div className="py-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onToggle();
              }}
              disabled={action.disabled}
              className={`group flex items-center w-full px-4 py-3 text-sm text-left hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] font-medium rounded-xl mx-2 my-1 shadow-sm hover:shadow-md ${
                action.color || 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dropdown states
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach(key => {
        if (openDropdowns[key] && dropdownRefs.current[key] && !dropdownRefs.current[key]!.contains(event.target as Node)) {
          setOpenDropdowns(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdowns]);

  // Toggle dropdown
  const toggleDropdown = (id: string) => {
    setOpenDropdowns(prev => ({ 
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), // Close all others
      [id]: !prev[id] 
    }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user has admin access
      if (!session || session.user?.role !== 'admin') {
        console.log('User does not have admin access:', session?.user?.role);
        return;
      }
      
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/products'),
        fetch('/api/admin/orders')
      ]);

      // Check for authentication errors
      if (usersRes.status === 401 || productsRes.status === 401 || ordersRes.status === 401) {
        console.error('Authentication failed for admin endpoints');
        alert('Authentication failed. Please ensure you are logged in as an admin.');
        return;
      }

      const usersData = await usersRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      console.log('Fetched data:', { 
        users: usersData?.length || 0, 
        products: productsData?.length || 0, 
        orders: ordersData?.length || 0 
      });

      setUsers(usersData || []);
      setProducts(productsData || []);
      setOrders(ordersData || []);

      // Calculate dashboard statistics
      const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + order.total_amount, 0);
      const thisMonth = new Date().getMonth();
      const monthlyRevenue = ordersData
        .filter((order: Order) => new Date(order.created_at).getMonth() === thisMonth)
        .reduce((sum: number, order: Order) => sum + order.total_amount, 0);

      const farmers = usersData.filter((user: User) => user.role === 'farmer');
      const customers = usersData.filter((user: User) => user.role === 'customer');
      
      // Calculate top farmers
      const farmerStats = farmers.map((farmer: User) => {
        const farmerOrders = ordersData.filter((order: Order) => order.farmer_id === farmer.id);
        const revenue = farmerOrders.reduce((sum: number, order: Order) => sum + order.total_amount, 0);
        return {
          name: farmer.name,
          revenue,
          orders: farmerOrders.length
        };
      }).sort((a: { name: string; revenue: number; orders: number }, b: { name: string; revenue: number; orders: number }) => b.revenue - a.revenue).slice(0, 5);

      // Generate monthly data for the last 6 months
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const monthOrders = ordersData.filter((order: Order) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        });
        const revenue = monthOrders.reduce((sum: number, order: Order) => sum + order.total_amount, 0);
        monthlyData.push({ month: monthName, revenue, orders: monthOrders.length });
      }

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter((order: Order) => order.status === 'pending').length,
        totalProducts: productsData.length,
        lowStockProducts: productsData.filter((product: Product) => product.stock_quantity < 10).length,
        totalUsers: usersData.length,
        totalFarmers: farmers.length,
        totalCustomers: customers.length,
        topFarmers: farmerStats,
        topProducts: [],
        monthlyData
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show a user-friendly error message
      alert('Failed to load dashboard data. Please refresh the page or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    toast.success('Logged out successfully!');
  };

  // User Management Functions
  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const addedUser = await response.json();
        setUsers([...users, addedUser]);
        setNewUser({ name: '', email: '', password: '', role: 'customer' });
        setShowAddUserModal(false);
        await fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        await fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Product Management Functions
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      // Prepare clean update data - only send fields that should be updated
      const updateData = {
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        stock_quantity: editingProduct.stock_quantity,
        description: editingProduct.description,
        is_active: editingProduct.is_active !== false
      };
      
      console.log('Updating product with clean data:', updateData);
      
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const updatedProduct = await response.json();
        console.log('Updated product response:', updatedProduct);
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setShowEditProductModal(false);
        setEditingProduct(null);
        await fetchDashboardData(); // Refresh data
        alert('Product updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Update failed:', errorData);
        alert(`Failed to update product: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Error updating product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleProductVisibility = async (productId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      } else {
        alert('Failed to update product visibility');
      }
    } catch (error) {
      console.error('Error updating product visibility:', error);
      alert('Error updating product visibility');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        await fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="glass rounded-3xl shadow-2xl p-12 text-center relative z-10 animate-scale-in">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
              <Shield className="h-10 w-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-600">Preparing your administrative tools...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <Toaster position="top-center" />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className="w-72 glass min-h-screen p-6 shadow-2xl border-r border-white/20 backdrop-blur-xl">
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Admin Panel</h1>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium">🌱 Farm E-Commerce Platform</p>
          </div>
          
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center space-x-3 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg hover:from-emerald-600 hover:to-blue-700' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600'
              }`}
            >
              <Activity className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center space-x-3 ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg hover:from-emerald-600 hover:to-blue-700' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600'
              }`}
            >
              <UserPlus className="h-5 w-5" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center space-x-3 ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg hover:from-emerald-600 hover:to-blue-700' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600'
              }`}
            >
              <Archive className="h-5 w-5" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center space-x-3 ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg hover:from-emerald-600 hover:to-blue-700' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Orders</span>
            </button>
          </nav>

          <div className="mt-10 pt-6 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all font-medium flex items-center space-x-3 hover:shadow-md"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8 animate-slide-up">
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Dashboard Overview</h2>
                <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your farm e-commerce platform. ✨</p>
                <div className="mt-4 text-sm text-gray-500 bg-gradient-to-r from-emerald-50 to-blue-50 p-3 rounded-lg border border-emerald-200/50">
                  <span className="font-medium">Current user:</span> {session?.user?.email} ({session?.user?.role}) | 
                  <span className="font-medium"> Users:</span> {users.length} | <span className="font-medium">Products:</span> {products.length} | <span className="font-medium">Orders:</span> {orders.length}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  change="+12% from last month"
                  icon="💰"
                />
                <MetricCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  change={`${stats.pendingOrders} pending`}
                  icon="🛒"
                />
                <MetricCard
                  title="Products"
                  value={stats.totalProducts}
                  change={`${stats.lowStockProducts} low stock`}
                  icon="📦"
                />
                <MetricCard
                  title="Users"
                  value={stats.totalUsers}
                  change={`${stats.totalFarmers} farmers, ${stats.totalCustomers} customers`}
                  icon="👥"
                />
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
                  <SimpleBarChart data={stats.monthlyData} title="Monthly Revenue Trends" />
                </div>

                <div className="glass rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">🏆 Top Performing Farmers</h3>
                  <div className="space-y-4">
                    {stats.topFarmers.map((farmer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 glass rounded-xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div>
                          <p className="font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{farmer.name}</p>
                          <p className="text-sm text-gray-600">{farmer.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 text-lg">${farmer.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-slide-up">
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">👥 User Management</h2>
                    <p className="text-gray-600 mt-2">Manage farmers, customers, and administrators</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg font-medium flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add User</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-3 glass border border-emerald-200 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 backdrop-blur-sm"
                    />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-3 glass border border-emerald-200 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 backdrop-blur-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="farmer">Farmers</option>
                      <option value="customer">Customers</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl shadow-xl border border-white/20 overflow-visible relative">
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-100/80 to-blue-100/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <div className="text-6xl mb-4">👥</div>
                            <div className="text-xl font-semibold mb-2">No users found</div>
                            <div className="text-sm">Try adjusting your search or filter criteria</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {user.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            user.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' :
                            user.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ActionDropdown
                            id={`user-${user.id}`}
                            isOpen={openDropdowns[`user-${user.id}`] || false}
                            onToggle={() => toggleDropdown(`user-${user.id}`)}
                            dropdownRef={(ref) => dropdownRefs.current[`user-${user.id}`] = ref}
                            actions={[
                              {
                                label: 'View Profile',
                                icon: <Eye className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement view profile
                                  console.log('View profile for user:', user.id);
                                },
                                color: 'text-blue-600 hover:text-blue-800'
                              },
                              {
                                label: 'Edit User',
                                icon: <Edit className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement edit user
                                  console.log('Edit user:', user.id);
                                },
                                color: 'text-green-600 hover:text-green-800'
                              },
                              {
                                label: 'Send Email',
                                icon: <Mail className="h-4 w-4" />,
                                onClick: () => {
                                  window.open(`mailto:${user.email}`, '_blank');
                                },
                                color: 'text-purple-600 hover:text-purple-800'
                              },
                              {
                                label: 'Change Role',
                                icon: <Shield className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement role change
                                  console.log('Change role for user:', user.id);
                                },
                                color: 'text-yellow-600 hover:text-yellow-800',
                                disabled: user.role === 'admin'
                              },
                              {
                                label: 'Activity Log',
                                icon: <Activity className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement activity log
                                  console.log('View activity for user:', user.id);
                                },
                                color: 'text-indigo-600 hover:text-indigo-800'
                              },
                              {
                                label: 'Delete User',
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => handleDeleteUser(user.id),
                                color: 'text-red-600 hover:text-red-800',
                                disabled: user.role === 'admin'
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800">Product Management</h2>
                <p className="text-gray-600 mt-2">Monitor and manage all farm products</p>
              </div>
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 overflow-visible relative">
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-blue-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <div className="text-6xl mb-4">📦</div>
                            <div className="text-xl font-semibold mb-2">No products found</div>
                            <div className="text-sm">Add some products to get started</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                              🌱
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">SKU: {product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{product.category || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">${product.price || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            (product.stock_quantity || 0) < 10 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {product.stock_quantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            product.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active !== false ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ActionDropdown
                            id={`product-${product.id}`}
                            isOpen={openDropdowns[`product-${product.id}`] || false}
                            onToggle={() => toggleDropdown(`product-${product.id}`)}
                            dropdownRef={(ref) => dropdownRefs.current[`product-${product.id}`] = ref}
                            actions={[
                              {
                                label: 'Edit Product',
                                icon: <Edit className="h-4 w-4" />,
                                onClick: () => handleEditProduct(product),
                                color: 'text-blue-600 hover:text-blue-800'
                              },
                              {
                                label: product.is_active !== false ? 'Hide Product' : 'Show Product',
                                icon: product.is_active !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
                                onClick: () => toggleProductVisibility(product.id, product.is_active !== false),
                                color: 'text-yellow-600 hover:text-yellow-800'
                              },
                              {
                                label: 'View Analytics',
                                icon: <Activity className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement product analytics
                                  console.log('View analytics for product:', product.id);
                                },
                                color: 'text-purple-600 hover:text-purple-800'
                              },
                              {
                                label: 'Duplicate Product',
                                icon: <UserPlus className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement product duplication
                                  console.log('Duplicate product:', product.id);
                                },
                                color: 'text-green-600 hover:text-green-800'
                              },
                              {
                                label: 'Archive Product',
                                icon: <Archive className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement product archiving
                                  console.log('Archive product:', product.id);
                                },
                                color: 'text-orange-600 hover:text-orange-800'
                              },
                              {
                                label: 'Delete Product',
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => handleDeleteProduct(product.id),
                                color: 'text-red-600 hover:text-red-800'
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800">Order Management</h2>
                <p className="text-gray-600 mt-2">Track and manage all customer orders</p>
              </div>
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 overflow-visible relative">
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-blue-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Farmer</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <div className="text-6xl mb-4">🛒</div>
                            <div className="text-xl font-semibold mb-2">No orders found</div>
                            <div className="text-sm">Orders will appear here when customers make purchases</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                      <tr key={order.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                              📦
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">#{order.id || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Order</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {users.find(u => u.id === order.user_id)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {order.farmer_id ? (users.find(u => u.id === order.farmer_id)?.name || 'Unknown') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">${order.total_amount || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ActionDropdown
                            id={`order-${order.id}`}
                            isOpen={openDropdowns[`order-${order.id}`] || false}
                            onToggle={() => toggleDropdown(`order-${order.id}`)}
                            dropdownRef={(ref) => dropdownRefs.current[`order-${order.id}`] = ref}
                            actions={[
                              {
                                label: 'View Details',
                                icon: <Eye className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement view order details
                                  console.log('View details for order:', order.id);
                                },
                                color: 'text-blue-600 hover:text-blue-800'
                              },
                              {
                                label: 'Edit Order',
                                icon: <Edit className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement edit order
                                  console.log('Edit order:', order.id);
                                },
                                color: 'text-green-600 hover:text-green-800'
                              },
                              {
                                label: 'Contact Customer',
                                icon: <Mail className="h-4 w-4" />,
                                onClick: () => {
                                  const customer = users.find(u => u.id === order.user_id);
                                  if (customer?.email) {
                                    window.open(`mailto:${customer.email}?subject=Regarding Order #${order.id}`, '_blank');
                                  } else {
                                    alert('Customer email not found');
                                  }
                                },
                                color: 'text-purple-600 hover:text-purple-800'
                              },
                              {
                                label: 'Order Timeline',
                                icon: <Activity className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement order timeline
                                  console.log('View timeline for order:', order.id);
                                },
                                color: 'text-indigo-600 hover:text-indigo-800'
                              },
                              {
                                label: 'Export Invoice',
                                icon: <Archive className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement export invoice
                                  console.log('Export invoice for order:', order.id);
                                },
                                color: 'text-orange-600 hover:text-orange-800'
                              },
                              {
                                label: 'Cancel Order',
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => {
                                  // TODO: Implement cancel order
                                  console.log('Cancel order:', order.id);
                                },
                                color: 'text-red-600 hover:text-red-800',
                                disabled: order.status === 'completed'
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="customer">Customer</option>
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price || 0}
                  onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock_quantity || 0}
                  onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingProduct.is_active !== false}
                  onChange={(e) => setEditingProduct({...editingProduct, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Visible to customers
                </label>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleUpdateProduct}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Product
              </button>
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
