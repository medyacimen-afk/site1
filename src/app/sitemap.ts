import { MetadataRoute } from 'next'
import { districts, services, slugify } from '@/lib/seo-data'

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

    // Dynamic SEO Pages (All Districts + Selected Services)
    const seoPages: MetadataRoute.Sitemap = []

    districts.forEach((district) => {
        // Essential and Commercial services for every district
        const relevantServices = services.filter(s => s.category === 'Ticari' || s.category === 'Temel');
        
        relevantServices.forEach((service) => {
            const slug = `${slugify(district.name)}-${service.id}`
            seoPages.push({
                url: `${baseUrl}/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            })
        })
    })

    return [...mainPages, ...seoPages]
}
