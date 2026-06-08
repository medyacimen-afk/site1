import React from 'react';

interface JsonLdProps {
    type: 'LocalBusiness' | 'Organization' | 'ProfessionalService';
    data: any;
}

export default function JsonLd({ type, data }: JsonLdProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

    const baseData = {
        "@context": "https://schema.org",
        "@type": type,
        "name": process.env.NEXT_PUBLIC_SITE_NAME || "Profesyonel Düğün Fotoğrafçısı",
        "url": siteUrl,
        "description": "Profesyonel düğün fotoğrafçılığı ve dış çekim hizmetleri.",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "TR"
        },
    };

    const finalData = { ...baseData, ...data };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(finalData) }}
        />
    );
}
