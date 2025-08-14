'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Shield, 
  Tractor, 
  ShoppingCart, 
  Activity,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    if (!session) {
      // Not authenticated, redirect to login
      router.push('/');
      return;
    }

    // Redirect based on user role
    const userRole = (session.user as any)?.role;
    
    switch (userRole) {
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
        // If no role or unknown role, redirect to home
        router.push('/');
        break;
    }
  }, [session, status, router]);

  // Show loading state while checking authentication and redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="glass rounded-3xl shadow-2xl p-12 text-center relative z-10 animate-scale-in max-w-md">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
            <Activity className="h-10 w-10 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' ? 'Loading Dashboard...' : 'Redirecting...'}
        </h2>
        
        <p className="text-gray-600 mb-8">
          {status === 'loading' 
            ? 'Checking your credentials...' 
            : session 
              ? `Taking you to your ${(session.user as any)?.role || 'user'} dashboard`
              : 'Redirecting to login...'
          }
        </p>

        {/* Role indicators */}
        {session && (
          <div className="flex justify-center space-x-6 mb-8">
            <div className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-500 ${
              (session.user as any)?.role === 'admin' 
                ? 'glass border-2 border-purple-300 scale-110 shadow-xl' 
                : 'opacity-30'
            }`}>
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-xs font-semibold text-purple-700">Admin</span>
            </div>
            
            <div className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-500 ${
              (session.user as any)?.role === 'farmer' 
                ? 'glass border-2 border-emerald-300 scale-110 shadow-xl' 
                : 'opacity-30'
            }`}>
              <Tractor className="h-8 w-8 text-emerald-600 mb-2" />
              <span className="text-xs font-semibold text-emerald-700">Farmer</span>
            </div>
            
            <div className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-500 ${
              (session.user as any)?.role === 'customer' 
                ? 'glass border-2 border-blue-300 scale-110 shadow-xl' 
                : 'opacity-30'
            }`}>
              <ShoppingCart className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-xs font-semibold text-blue-700">Customer</span>
            </div>
          </div>
        )}

        {/* Loading animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Sparkle decorations */}
        <div className="absolute top-4 left-4">
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
        </div>
        <div className="absolute top-8 right-6">
          <Sparkles className="h-3 w-3 text-pink-400 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-6 left-8">
          <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
}
