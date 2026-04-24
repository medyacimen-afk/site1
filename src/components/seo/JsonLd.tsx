import React from 'react';

interface JsonLdProps {
    type: 'LocalBusiness' | 'Organization' | 'ProfessionalService';
    data: any;
}

export default function JsonLd({ type, data }: JsonLdProps) {
    const baseData = {
        "@context": "https://schema.org",
        "@type": type,
        "name": "Sivas Düğün Fotoğrafçısı",
        "alternateName": "Duru Foto Film",
        "url": "https://sivasdugunfotografcisi.com",
        "logo": "https://sivasdugunfotografcisi.com/logo.png",
        "image": "https://sivasdugunfotografcisi.com/og-image.jpg",
        "description": "Sivas'ın profesyonel düğün fotoğrafçısı. Dış çekim, düğün hikayesi ve drone çekimleri.",
        "telephone": "0532 407 1563",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Sivas",
            "addressRegion": "Sivas Merkez",
            "addressCountry": "TR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 39.7477,
            "longitude": 37.0179
        },
        "sameAs": [
            "https://www.instagram.com/sivasdugunfotografcisi",
            "https://www.facebook.com/sivasdugunfotografcisi"
        ]
    };

    const finalData = { ...baseData, ...data };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(finalData) }}
        />
    );
}
