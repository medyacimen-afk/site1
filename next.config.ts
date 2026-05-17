import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    serverExternalPackages: ['iyzipay', 'firebase-admin'],
    outputFileTracingIncludes: {
        '/api/iyzico/**/*': ['./node_modules/iyzipay/lib/**/*'],
    },
};

export default nextConfig;
