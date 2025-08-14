'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingCart, Search, User, Plus, Minus, X, LogOut, UserCircle, MapPin, Package, CheckCircle, Clock, Truck, Settings } from 'lucide-react';
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
}

interface Order {
  _id: string;
  customerId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
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

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (session.user as any)?.role !== 'customer') {
      router.push('/');
      return;
    }

    fetchProducts();
    loadUserProfile();
  }, [session, status, router]);

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

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
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
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Filter orders for current customer
        const customerOrders = data.filter((order: Order) => 
          order.customerId === (session?.user as any)?.id
        );
        setOrders(customerOrders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      toast.error('Error loading orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success('Added to cart!');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
    toast.success('Removed from cart!');
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p._id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const clearCart = () => {
    setCart({});
    toast.success('Cart cleared!');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    toast.success('Logged out successfully!');
  };

  const markAsDelivered = async (orderId: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: 'delivered' }),
      });

      if (response.ok) {
        toast.success('Order marked as delivered!');
        fetchOrders(); // Refresh orders
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Error updating order status');
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: profileData
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setShowEditProfile(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }

    // Check if cart is empty
    if (Object.keys(cart).length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if products are loaded
    if (products.length === 0) {
      toast.error('Products are still loading, please wait');
      return;
    }

    try {
      const orderItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p._id === productId);
        if (!product) {
          console.error('Product not found for ID:', productId);
        }
        return {
          productId,
          productName: product?.name || 'Unknown Product',
          quantity,
          price: product?.price || 0
        };
      });

      const totalAmount = getCartTotal();
      
      if (!totalAmount || totalAmount <= 0) {
        toast.error('Cart total is invalid. Please check your cart items.');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount,
          shippingAddress: {
            address: shippingAddress,
            city: 'Default City',
            state: 'Default State',
            zipCode: '00000',
            country: 'Default Country'
          },
        }),
      });

      if (response.ok) {
        const order = await response.json();
        toast.success(`Order placed successfully! Order #${order._id.slice(-6)}`);
        setCart({});
        setShowCart(false);
        setShowCheckout(false);
        setShippingAddress('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Error placing order');
      console.error('Checkout error:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const cartItemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

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
              <ShoppingCart className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Marketplace</h2>
          <p className="text-gray-600">Discovering fresh farm products...</p>
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
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Farm Marketplace
                </h1>
                <p className="text-gray-600 font-medium">Fresh products from local farms</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4 text-emerald-500" />
                <span>{products.length} Products</span>
              </div>
              
              <button
                onClick={() => {
                  setShowOrders(true);
                  fetchOrders();
                }}
                className="relative p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
                title="My Orders"
              >
                <Package className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
                title="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowProfile(true)}
                className="relative p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
                title="Profile"
              >
                <User className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleLogout}
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
                  Welcome back, {session?.user?.name || 'Customer'}! 🛒
                </h2>
                <p className="text-gray-600">
                  Discover fresh products from local farms
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{products.length}</div>
                  <div className="text-sm text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{cartItemCount}</div>
                  <div className="text-sm text-gray-500">In Cart</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {filteredProducts.map((product) => (
            <div key={product._id} className="glass rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {product.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ${product.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    by {product.farmerName}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {cart[product._id] ? (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-gray-800 min-w-[2rem] text-center">{cart[product._id]}</span>
                    <button
                      onClick={() => addToCart(product._id)}
                      className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock === 0}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="glass rounded-3xl shadow-2xl p-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No products found. Try adjusting your search or category filter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                🛒 Shopping Cart
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-2">Add some fresh products to get started!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find(p => p._id === productId);
                    if (!product) return null;
                    return (
                      <div key={productId} className="glass rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h4 className="font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">${product.price} each</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="p-2 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg min-w-[3rem] text-center font-semibold shadow-lg">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(productId)}
                              className="p-2 bg-gradient-to-r from-emerald-100 to-blue-100 hover:from-emerald-200 hover:to-blue-200 text-emerald-600 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                              ${(product.price * quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/20 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      Total: ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      🚀 Checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <UserCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{(session?.user as any)?.username}</h3>
              <p className="text-gray-500">Customer</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowOrders(true);
                  setShowProfile(false);
                  fetchOrders();
                }}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
              >
                Order History
              </button>
              <button
                onClick={() => {
                  setShowEditProfile(true);
                  setShowProfile(false);
                }}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = products.find(p => p._id === productId);
                  if (!product) return null;
                  return (
                    <div key={productId} className="flex justify-between">
                      <span className="text-sm">{product.name} x {quantity}</span>
                      <span className="text-sm font-medium">${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Shipping Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Enter your complete shipping address..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!shippingAddress.trim()}
                className="flex-1 px-4 py-2 bg-black hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Orders</h2>
              <button
                onClick={() => {
                  setShowOrders(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
              </div>
            ) : selectedOrder ? (
              // Order Details View
              <div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ← Back to Orders
                </button>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        Order #{selectedOrder._id.slice(-8)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        selectedOrder.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Order Items</h4>
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
                      <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Shipping Address</h4>
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
                  {selectedOrder.status === 'shipped' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => markAsDelivered(selectedOrder._id)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark as Delivered</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Orders List View
              <div>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">No orders found</p>
                    <p className="text-gray-500 dark:text-gray-500">Your order history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="glass rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-300">
                              Order #{order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium mt-1">
                              📅 {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              📦 {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                            <div className="flex items-center justify-end space-x-2 mt-2">
                              <span className={`px-3 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                                order.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                                order.status === 'confirmed' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200' :
                                order.status === 'shipped' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200' :
                                order.status === 'delivered' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                                'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                              }`}>
                                {order.status === 'delivered' ? '✅ ' : order.status === 'shipped' ? '🚚 ' : order.status === 'confirmed' ? '📋 ' : order.status === 'pending' ? '⏳ ' : '❌ '}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              {order.status === 'shipped' && (
                                <Truck className="h-5 w-5 text-indigo-600 animate-pulse" />
                              )}
                              {order.status === 'delivered' && (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              )}
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
        </div>
      )}
    </div>
  );
}
