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
        '/api/iyzico/payment': ['./node_modules/iyzipay/**/*'],
        '/api/iyzico/callback': ['./node_modules/iyzipay/**/*'],
    },
};

export default nextConfig;
