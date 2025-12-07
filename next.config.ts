import type { NextConfig } from "next";

const nextConfig = {
  // Transpile wallet adapter packages for React 19 compatibility
  transpilePackages: [
    '@rentfuse-labs/neo-wallet-adapter-base',
    '@rentfuse-labs/neo-wallet-adapter-react',
    '@rentfuse-labs/neo-wallet-adapter-wallets',
    '@rentfuse-labs/neo-wallet-adapter-ant-design',
  ],
  // Add empty turbopack config to silence the warning
  // We use webpack for Buffer polyfill
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Polyfill Buffer for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
      };
    }
    // Exclude better-sqlite3 from bundling (not needed for Supabase)
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('better-sqlite3');
      } else {
        config.externals = [config.externals, 'better-sqlite3'];
      }
    }
    return config;
  },
} satisfies NextConfig;

export default nextConfig;
