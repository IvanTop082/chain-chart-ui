import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    config.externals = config.externals || [];
    if (typeof config.externals === 'function') {
      const originalExternals = config.externals;
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : []),
        ({ request }, callback) => {
          if (request && request.includes('better-sqlite3')) {
            return callback(null, 'commonjs ' + request);
          }
          if (typeof originalExternals === 'function') {
            return originalExternals({ request }, callback);
          }
          callback();
        },
      ];
    } else if (Array.isArray(config.externals)) {
      config.externals.push('better-sqlite3');
    } else {
      config.externals = [config.externals, 'better-sqlite3'];
    }
    return config;
  },
};

export default nextConfig;
