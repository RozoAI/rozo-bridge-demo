import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No remote image patterns needed since we're using local logos
  
  // Build optimizations
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    // Optimize bundle size
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Webpack optimizations for large dependencies
  webpack: (config, { isServer }) => {
    // Reduce bundle size by excluding server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize large crypto/wallet dependencies
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'bigint': 'commonjs bigint',
      });
    }
    
    return config;
  },
  
  // Output optimizations
  output: 'standalone',
  
  // Reduce build time
  swcMinify: true,
};

export default nextConfig;
