/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    images: {
        domains: ['lh3.googleusercontent.com', 'legeztstorage.blob.core.windows.net'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
