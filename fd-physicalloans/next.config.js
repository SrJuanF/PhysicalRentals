/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }

    // Handle problematic modules
    config.externals = config.externals || [];
    config.externals.push({
      "pino-pretty": "pino-pretty",
      "@toruslabs/eccrypto": "@toruslabs/eccrypto",
    });

    return config;
  },
  serverExternalPackages: ["pino-pretty", "@toruslabs/eccrypto"],
};

export default nextConfig;
