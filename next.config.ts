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
    return config;
  },
};

export default nextConfig;
