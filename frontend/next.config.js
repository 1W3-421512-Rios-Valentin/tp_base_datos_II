/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:5000/uploads/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;