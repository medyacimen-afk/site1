import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fotografci.com'

    // Statik sayfalar — slug tabanlı dinamik SEO sayfaları kaldırıldı
    const mainPages = [
        '',
        '/about',
        '/contact',
        '/portfolio',
        '/blog',
        '/packages',
        '/videos',
        '/online-rezervasyon',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return mainPages
}
