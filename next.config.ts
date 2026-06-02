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
    // iyzipay npm paketi kaldirildi; Iyzico artik src/lib/iyzico.ts ile dogrudan
    // REST API uzerinden cagriliyor. Boylece serverless trace/packaging sorunu yok.
    serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
