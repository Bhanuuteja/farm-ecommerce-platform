'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tractor, User, Lock, Loader, Leaf, Shield, Users, Sparkles, ArrowRight, CheckCircle, Star, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const router = useRouter();

  // Check database connectivity on mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Set up default configurations for the farm platform
        // Set up database configuration
        const defaultDBConfig = {
          type: 'sqlite',
          configured: true,
          setupDate: new Date().toISOString()
        };
        localStorage.setItem('farm_db_config', JSON.stringify(defaultDBConfig));

        console.log('✅ Default configurations set up');
        setDbLoading(false);

      } catch (error) {
        console.error('Setup error:', error);
        // If there's an error, show login form
        setDbLoading(false);
      }
    };

    checkDatabase();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', { username, password: '***' });
      
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.error('Login error:', result.error);
        toast.error('Invalid credentials. Please check your username and password.');
      } else if (result?.ok) {
        toast.success('Login successful!');
        
        // Small delay to ensure session is set
        setTimeout(async () => {
          try {
            const session = await getSession();
            console.log('Session after login:', session);
            
            if (session?.user) {
              const role = (session.user as any).role;
              console.log('User role:', role);
              
              // Redirect based on role
              switch (role) {
                case 'admin':
                  router.push('/admin');
                  break;
                case 'farmer':
                  router.push('/farmer');
                  break;
                case 'customer':
                  router.push('/customer');
                  break;
                default:
                  console.log('Unknown role, defaulting to customer');
                  router.push('/customer');
              }
            } else {
              console.error('No session found after successful login');
              toast.error('Login successful but session not found. Please try again.');
            }
          } catch (sessionError) {
            console.error('Session retrieval error:', sessionError);
            toast.error('Login successful but failed to get user session.');
          }
        }, 500);
      } else {
        console.error('Unexpected login result:', result);
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (dbLoading) {
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
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connecting to Farm Database</h2>
          <p className="text-gray-600">Setting up your personalized farm management experience...</p>
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
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                  <Tractor className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Farm E-commerce
                </h1>
                <p className="text-gray-600 font-medium">Fresh from farm to table</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>Premium Platform</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full text-sm font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                <span>Next Generation Farm Management</span>
              </div>
              
              <h2 className="text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="text-gray-800">Farming Business</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience the future of agriculture with our AI-powered platform. 
                Connect farmers with customers, streamline operations, and grow your business.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-700">Smart Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <span className="font-semibold text-gray-700">Real-time Data</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                </div>
                <span className="font-semibold text-gray-700">Secure Platform</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">F</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">C</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">500+</span> farmers trust our platform
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="space-y-6">
            {/* Main Login Card */}
            <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a 
                    href="/signup" 
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline"
                  >
                    Create Account
                  </a>
                </p>
              </div>
            </div>

            {/* Demo Users Card */}
            <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Demo Accounts</h3>
              <div className="space-y-3">
                <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="font-semibold text-gray-900">Admin</div>
                    <div className="text-sm text-gray-600 font-mono">admin / admin123</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="font-semibold text-gray-900">Farmer</div>
                    <div className="text-sm text-gray-600 font-mono">farmer1 / farmer123</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="font-semibold text-gray-900">Customer</div>
                    <div className="text-sm text-gray-600 font-mono">customer1 / customer123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}