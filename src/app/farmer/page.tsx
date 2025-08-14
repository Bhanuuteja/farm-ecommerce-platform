'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2, Search, User, LogOut, Leaf, X, Bell, Clock, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  sku: string;
  farmerId: string;
  farmerName: string;
  stock: number;
  description: string;
  images?: string[];
}

interface Order {
  _id: string;
  customerId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  orderDate: string;
  shippingAddress?: string | {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function FarmerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    sku: '',
    stock: '',
    description: '',
    images: [] as string[]
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (session.user as any)?.role !== 'farmer') {
      router.push('/');
      return;
    }

    fetchProducts();
    fetchOrders();
  }, [session, status, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Filter products by farmer
        const farmerProducts = data.filter((product: Product) => 
          product.farmerId === (session?.user as any)?.id
        );
        setProducts(farmerProducts);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      toast.error('Error loading products');
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
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      toast.error('Error loading orders');
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const userData = await response.json();
        if (userData.profile) {
          setProfileData({
            firstName: userData.profile.firstName || '',
            lastName: userData.profile.lastName || '',
            phone: userData.profile.phone || '',
            address: userData.profile.address || ''
          });
        }
      } else {
        console.log('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct ? `/api/products` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProduct ? {
          ...formData,
          _id: editingProduct._id,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        } : {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }),
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product added!');
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          category: '',
          price: '',
          sku: '',
          stock: '',
          description: '',
          images: []
        });
        setImagePreview([]);
        fetchProducts();
      } else {
        toast.error('Failed to save product');
      }
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: productId }),
      });

      if (response.ok) {
        toast.success('Product deleted!');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      sku: product.sku,
      stock: product.stock.toString(),
      description: product.description,
      images: product.images || []
    });
    setShowEditModal(true);
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
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order');
      }
    } catch (error) {
      toast.error('Error updating order');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Leaf className="h-10 w-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Farmer Dashboard</h2>
          <p className="text-gray-600">Preparing your farm management tools...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
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
      
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Farm Dashboard
                </h1>
                <p className="text-gray-600 font-medium">Manage your products and orders</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4 text-emerald-500" />
                <span>{products.length} Products</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Bell className="h-4 w-4 text-blue-500" />
                <span>{orders.length} Orders</span>
              </div>
              
              <button
                onClick={() => {
                  setShowProfile(true);
                  loadUserProfile();
                }}
                className="relative p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
                title="Profile"
              >
                <User className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push('/');
                  toast.success('Logged out successfully!');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome back, {session?.user?.name || 'Farmer'}! 🌱
                </h2>
                <p className="text-gray-600">
                  Manage your farm products and track orders from your dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{products.length}</div>
                  <div className="text-sm text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-gray-500">Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="flex bg-white/50">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                }`}
              >
                <Package className="h-5 w-5 inline mr-2" />
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                }`}
              >
                <Bell className="h-5 w-5 inline mr-2" />
                Orders ({orders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Controls */}
            <div className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-200 dark:border-emerald-700 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {filteredProducts.map((product, index) => (
            <div key={product._id} className="glass rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}>
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-300">
                    {product.name}
                  </h3>
                  <div className="text-xs font-medium text-emerald-600 bg-gradient-to-r from-emerald-100 to-blue-100 px-2 py-1 rounded-full border border-emerald-200">
                    🌱
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm px-3 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 rounded-full font-semibold shadow-sm border border-emerald-200/50">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 px-2 py-1 rounded-md">
                    SKU: {product.sku}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ${product.price}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Stock</span>
                    <span className={`text-sm font-bold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {product.stock} units
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No products found. Add your first product to get started!
            </p>
          </div>
        )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {orders.map((order) => (
                <div key={order._id} className="glass rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-300">
                        Order #{order._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        📅 {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <span className={`text-sm px-3 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                        order.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                        order.status === 'confirmed' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200' :
                        order.status === 'shipped' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200' :
                        order.status === 'delivered' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                        'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                      }`}>
                        {order.status === 'delivered' ? '✅ ' : order.status === 'shipped' ? '🚚 ' : order.status === 'confirmed' ? '📋 ' : order.status === 'pending' ? '⏳ ' : '❌ '}
                        {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center">
                      📦 Order Items:
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                          <span className="font-medium text-gray-800">
                            {item.productName} <span className="text-emerald-600 font-bold">x {item.quantity}</span>
                          </span>
                          <span className="font-bold text-blue-600">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center">
                        🏠 Shipping Address:
                      </h4>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-sm rounded-xl border border-blue-200/50">
                        <p className="text-sm text-gray-700 font-medium">
                          {typeof order.shippingAddress === 'string' 
                            ? order.shippingAddress 
                            : `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 font-semibold"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept Order</span>
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'shipped')}
                        className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 font-semibold"
                      >
                        <Package className="h-4 w-4" />
                        <span>Mark as Shipped</span>
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        className="flex-1 min-w-[120px] px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No orders yet. Orders will appear here when customers place them.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    category: '',
                    price: '',
                    sku: '',
                    stock: '',
                    description: '',
                    images: []
                  });
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="">Select category</option>
                  <option value="vegetables">🥬 Vegetables</option>
                  <option value="fruits">🍎 Fruits</option>
                  <option value="dairy">🥛 Dairy</option>
                  <option value="grains">🌾 Grains</option>
                  <option value="herbs">🌿 Herbs</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">SKU</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const fileReaders = files.map(file => {
                      return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                      });
                    });
                    
                    Promise.all(fileReaders).then(results => {
                      setFormData(prev => ({ ...prev, images: [...prev.images, ...results] }));
                      setImagePreview([...imagePreview, ...results]);
                    });
                  }}
                  className="w-full p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
                
                {imagePreview.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={src} 
                          alt={`Preview ${index + 1}`} 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            const newPreviews = imagePreview.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, images: newImages }));
                            setImagePreview(newPreviews);
                          }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      category: '',
                      price: '',
                      sku: '',
                      stock: '',
                      description: '',
                      images: []
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                >
                  {editingProduct ? '✅ Update' : '🚀 Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">👤 Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-xl">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                {(session?.user as any)?.username}
              </h3>
              <p className="text-gray-600 font-medium">🌱 Farmer</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 glass rounded-xl text-center border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                  <p className="text-sm text-gray-600 mb-1">Products</p>
                  <p className="text-xl font-bold text-emerald-600">{products.length}</p>
                </div>
                <div className="p-4 glass rounded-xl text-center border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                  <p className="text-sm text-gray-600 mb-1">Orders</p>
                  <p className="text-xl font-bold text-blue-600">{orders.length}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowEditProfile(true);
                  setShowProfile(false);
                }}
                className="w-full p-3 text-left hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 rounded-lg transition-all duration-300 flex items-center text-gray-700 hover:text-emerald-600 hover:shadow-md"
              >
                <User className="h-4 w-4 mr-3" />
                <span className="font-medium">Edit Profile</span>
              </button>
              
              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push('/');
                  toast.success('Logged out successfully!');
                }}
                className="w-full p-3 text-left text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg transition-all duration-300 flex items-center hover:shadow-md"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">✏️ Edit Profile</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📞 Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏠 Farm Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Farm address"
                />
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
