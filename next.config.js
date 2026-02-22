/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    images: {
        domains: ['lh3.googleusercontent.com', 'legeztstorage.blob.core.windows.net', 'legeztstorage2347.blob.core.windows.net'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
            },
        ];
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    // Minimal Strategy: Network First for everything to safe storage
    runtimeCaching: [
        {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'offlineCache',
                expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
    ],
});

module.exports = withPWA(nextConfig);
