import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast', 'next-auth'],
  },
  
  // External packages for server components
  serverExternalPackages: ['mongoose'],
  
  // Skip ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Turbopack configuration
  turbopack: {
    // Enable all Turbopack optimizations
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // API route optimization
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize for speed
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
