import { MetadataRoute } from 'next'
import { districts, services, slugify, plateaus, plateauQueries, regionLocations, specialPages } from '@/lib/seo-data'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fotografci.com'

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

    // 3. Çevre il/ilçe sayfaları (tüm hizmetlerle)
    const regionPages: MetadataRoute.Sitemap = []
    regionLocations.forEach((loc) => {
        services.forEach((service) => {
            regionPages.push({
                url: `${baseUrl}/${loc.slug}-${service.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            })
        })
    })

    // 4. Özel konsept çekim sayfaları
    const specialPagesEntries: MetadataRoute.Sitemap = specialPages.map((sp) => ({
        url: `${baseUrl}/${sp.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...mainPages, ...districtPages, ...plateauPages, ...regionPages, ...specialPagesEntries]
}
