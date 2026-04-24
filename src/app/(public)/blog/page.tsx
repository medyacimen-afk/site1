"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

const blogPosts = [
    {
        id: 1,
        title: "Sivas Düğün Fotoğrafçısı – 2025 Dış Çekim & Kamera Hizmetleri",
        excerpt: "2025 sezonunda Sivas'ta dış çekim ve düğün hikayesi çekimlerinde bizi neler bekliyor? En popüler mekanlar ve yeni trendler...",
        date: "14 Temmuz 2025",
        author: "Sivas Düğün",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
        slug: "sivas-dugun-fotografcisi-2025-dis-cekim"
    },
    {
        id: 2,
        title: "2025 Yılında Sivas Düğün Fotoğrafçısı ile Unutulmaz Anılar",
        excerpt: "Düğün gününüzü ölümsüzleştirirken profesyonel bir ekiple çalışmanın avantajları ve size özel planlama ipuçları.",
        date: "18 Nisan 2025",
        author: "Sivas Düğün",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
        slug: "2025-yilinda-unutulmaz-anilar"
    },
    {
        id: 3,
        title: "Kredi Kartına 6 Taksit İmkanıyla Hayalinizdeki Çekimler",
        excerpt: "Ödeme kolaylıklarımız ve 2025 erken rezervasyon fırsatları hakkında tüm detaylar bu yazımızda.",
        date: "18 Nisan 2025",
        author: "Sivas Düğün",
        image: "https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=2070&auto=format&fit=crop",
        slug: "kredi-kartina-taksit-imkani"
    },
    {
        id: 4,
        title: "En İyi Sivas Düğün Fotoğrafçısı Nasıl Seçilir?",
        excerpt: "Doğru fotoğrafçıyı seçerken dikkat etmeniz gereken 5 altın kural. Tarz, bütçe ve ekipman kalitesi neden önemlidir?",
        date: "25 Ekim 2024",
        author: "Sivas Düğün",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
        slug: "en-iyi-sivas-dugun-fotografcisi"
    }
]

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-white pt-40 pb-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-foreground/40 tracking-[0.4em] uppercase text-[10px] mb-4"
                    >
                        Haberler & Hikayeler
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif text-foreground mb-6 leading-tight tracking-tight"
                    >
                        Blogger <span className="italic">Günlüğümüz</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-foreground/50 max-w-2xl font-light text-lg"
                    >
                        Düğün hazırlıkları, çekim ipuçları ve Sivas'ın en güzel çekim rotaları hakkında her şey.
                    </motion.p>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {blogPosts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <Link href={`/blog/${post.slug}`} className="block">
                                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-8 shadow-2xl">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-4 font-semibold">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {post.date}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-serif text-foreground mb-4 group-hover:text-primary transition-colors leading-snug">
                                    {post.title}
                                </h2>
                                <p className="text-foreground/50 font-light leading-relaxed mb-8 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-primary text-sm font-serif italic group-hover:gap-4 transition-all">
                                    Devamını Oku
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                {/* Pagination Placeholder */}
                <div className="mt-24 flex justify-center">
                    <Button variant="outline" className="rounded-full h-14 px-12 border-black/10 text-foreground hover:bg-primary hover:text-white font-serif italic text-lg transition-all">
                        Daha Fazla Yükle
                    </Button>
                </div>
            </div>
        </main>
    )
}
