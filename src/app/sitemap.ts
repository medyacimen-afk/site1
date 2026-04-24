import { MetadataRoute } from 'next'
import { districts, services, slugify, plateaus, plateauQueries } from '@/lib/seo-data'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://sivasdugunfotografcisi.com'

    // Main Pages
    const mainPages = [
        '',
        '/about',
        '/contact',
        '/portfolio',
        '/blog',
        '/packages',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }))

    // 1. Dynamic SEO Pages (All Districts + All Services)
    const districtPages: MetadataRoute.Sitemap = []
    districts.forEach((district) => {
        services.forEach((service) => {
            districtPages.push({
                url: `${baseUrl}/${slugify(district.name)}-${service.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            })
        })
    })

    // 2. Dynamic Plateau Pages (All Plateaus + All Queries)
    const plateauPages: MetadataRoute.Sitemap = []
    plateaus.forEach((plateau) => {
        // Base plateau page
        plateauPages.push({
            url: `${baseUrl}/${plateau.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        })

        // Plateau + Query combinations
        plateauQueries.forEach((query) => {
            plateauPages.push({
                url: `${baseUrl}/${plateau.id}-${query.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            })
        })
    })

    return [...mainPages, ...districtPages, ...plateauPages]
}
