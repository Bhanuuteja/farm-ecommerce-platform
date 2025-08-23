'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, ArrowLeft, UserCheck, Tractor, Store, ShoppingCart } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      address: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is valid before parsing JSON
      if (!response.ok) {
        const text = await response.text();
        console.error('Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          responseText: text
        });
        
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.error || `Server error (${response.status})`);
        } catch {
          toast.error(`Server error (${response.status}): ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Account created successfully! Logging you in...');
      
      // Auto-login after successful registration
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        // Redirect based on role
        const redirectMap = {
          admin: '/admin',
          farmer: '/farmer',
          customer: '/customer',
          agent: '/agent'
        };
        router.push(redirectMap[formData.role as keyof typeof redirectMap] || '/customer');
      } else {
        toast.success('Account created! Please login.');
        router.push('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <UserCheck className="h-5 w-5" />;
      case 'farmer': return <Tractor className="h-5 w-5" />;
      case 'agent': return <Store className="h-5 w-5" />;
      default: return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Manage the entire platform, users, and system settings';
      case 'farmer': return 'Sell your farm products and manage your inventory';
      case 'agent': return 'Help process orders and assist customers';
      default: return 'Browse and purchase fresh farm products';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-xl">
                <Leaf className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mt-4">
              Join Farm Market
            </h1>
            <p className="text-gray-600 mt-2">Create your account to get started</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 transition-all duration-300 ${
                step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-2xl p-8 border border-white/20">
            {step === 1 && (
              <div className="space-y-6 animate-slide-up">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>
                
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'customer', label: 'Customer', icon: 'ShoppingCart' },
                      { value: 'farmer', label: 'Farmer', icon: 'Tractor' },
                      { value: 'agent', label: 'Agent', icon: 'Store' },
                      { value: 'admin', label: 'Admin', icon: 'UserCheck' }
                    ].map((role) => (
                      <label key={role.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`p-3 border-2 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
                          formData.role === role.value
                            ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700'
                            : 'border-gray-200 bg-white/50 text-gray-600 hover:border-emerald-300'
                        }`}>
                          <div className="flex items-center justify-center mb-1">
                            {getRoleIcon(role.value)}
                          </div>
                          <div className="text-sm font-medium">{role.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                >
                  <span>Next</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Back</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="profile.firstName"
                      value={formData.profile.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="profile.lastName"
                      value={formData.profile.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="profile.phone"
                    value={formData.profile.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="profile.address"
                    value={formData.profile.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50/50 to-blue-50/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Your address"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
