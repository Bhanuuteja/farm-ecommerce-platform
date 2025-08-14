'use client';

import { useEffect, useState, Suspense } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, ArrowLeft, Shield, CheckCircle, Loader } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

function SignOutContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: callbackUrl 
      });
      toast.success('Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out. Please try again.');
      setIsSigningOut(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
                  <LogOut className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Sign Out
                </h1>
                <p className="text-gray-600 font-medium">Secure session management</p>
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-md w-full">
          {/* Sign Out Card */}
          <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20 animate-scale-in">
            <div className="text-center mb-8">
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LogOut className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign Out</h2>
              <p className="text-gray-600">Are you sure you want to sign out?</p>
            </div>

            {/* Current Session Info */}
            {session?.user && (
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {(session.user as any)?.username || session.user.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(session.user as any)?.role ? 
                        `${(session.user as any).role.charAt(0).toUpperCase() + (session.user as any).role.slice(1)} Account` : 
                        'User Account'
                      }
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSigningOut ? (
                  <>
                    <Loader className="animate-spin h-5 w-5" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    <span>Yes, Sign Out</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={isSigningOut}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="text-sm text-emerald-700">
                  <p className="font-semibold mb-1">Security Notice</p>
                  <p>Signing out will end your current session and require you to log in again to access your account.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? <span className="text-emerald-600 font-semibold cursor-pointer hover:text-emerald-700 transition-colors">Contact Support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignOutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <SignOutContent />
    </Suspense>
  );
}
