'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Users, Package, ShoppingCart, TrendingUp, LogOut, Headphones, Clock, CheckCircle, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Order {
  _id: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  orderDate: string;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string | {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Customer {
  _id: string;
  username: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeCustomers: 0
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (session.user as any)?.role !== 'agent') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchCustomers()
      ]);
    } catch (error) {
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        
        // Calculate stats
        setStats(prev => ({
          ...prev,
          totalOrders: data.length,
          pendingOrders: data.filter((o: Order) => o.status === 'pending').length,
          completedOrders: data.filter((o: Order) => o.status === 'delivered').length
        }));
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      toast.error('Error loading orders');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/users/list');
      if (response.ok) {
        const data = await response.json();
        const customerUsers = data.filter((user: any) => user.role === 'customer');
        setCustomers(customerUsers);
        
        setStats(prev => ({
          ...prev,
          activeCustomers: customerUsers.length
        }));
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      toast.error('Error loading customers');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status }),
      });

      if (response.ok) {
        toast.success(`Order ${status} successfully!`);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order');
      }
    } catch (error) {
      toast.error('Error updating order');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    toast.success('Logged out successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Headphones className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Agent Dashboard
                </h1>
                <p className="text-gray-500">
                  Welcome, {(session?.user as any)?.username}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Customers</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.activeCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Order Management
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Customer Support
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">#{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">${order.totalAmount.toFixed(2)}</p>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{order.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center justify-between p-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-800 dark:text-gray-200">Manage Orders</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.pendingOrders} pending</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('customers')}
                  className="w-full flex items-center justify-between p-3 text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-800 dark:text-gray-200">Customer Support</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.activeCustomers} customers</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Order Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage and track customer orders</p>
            </div>
            
            {selectedOrder ? (
              // Order Details View
              <div className="p-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ← Back to Orders
                </button>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        Order #{selectedOrder._id.slice(-8)}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Customer: {selectedOrder.customerName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Order Items</h5>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{item.productName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Shipping Address</h5>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">
                          {typeof selectedOrder.shippingAddress === 'string' 
                            ? selectedOrder.shippingAddress 
                            : `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} ${selectedOrder.shippingAddress.zipCode}, ${selectedOrder.shippingAddress.country}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'confirmed')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'shipped')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Orders List View
              <div className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                              Order #{order._id.slice(-8)}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Customer: {order.customerName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.orderDate).toLocaleDateString()} • {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 dark:text-gray-200">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer Support</h3>
              <p className="text-gray-600 dark:text-gray-400">View and manage customer information</p>
            </div>
            
            <div className="p-6">
              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No customers found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <div
                      key={customer._id}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {customer.profile?.firstName && customer.profile?.lastName
                              ? `${customer.profile.firstName} ${customer.profile.lastName}`
                              : customer.username}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                        </div>
                      </div>
                      {customer.profile?.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Phone: {customer.profile.phone}
                        </p>
                      )}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Orders: {orders.filter(order => order.customerId === customer._id).length}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
