"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { useContent } from '@/hooks/useContent'

export default function PortfolioGrid() {
    const { portfolio, loading } = useContent()

    const homeItems = React.useMemo(() => {
        const source = portfolio.filter(item => item.isHome).length > 0
            ? portfolio.filter(item => item.isHome)
            : portfolio;
        
        // Rastgele karıştırıp seçelim (Variety için)
        return [...source]
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);
    }, [portfolio]);

    if (loading) return (
        <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    )

    // Eğer veri yoksa boş bir alan veya örnek veri göstermeyelim, CMS'den eklenene kadar beklemesin
    if (portfolio.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Bölüm Başlığı */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div className="max-w-xl">
                        <span className="text-primary tracking-[0.4em] uppercase text-xs font-bold mb-4 block">Portfolyomuz</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans text-foreground font-medium tracking-tight">
                            Son <span className="italic font-serif text-primary">Çalışmalarımız</span>
                        </h2>
                    </div>
                    <Link
                        href="/portfolio"
                        className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-primary border-b border-primary/40 hover:border-primary pb-1 transition-colors shrink-0"
                    >
                        Tüm Galeriyi Gör <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {homeItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className="group relative"
                        >
                            <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-xl md:rounded-3xl bg-slate-100">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0 opacity-90 group-hover:opacity-100"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover:opacity-90 transition-opacity" />
                                
                                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transform translate-x-2 -translate-y-2 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-1 block">
                                        {item.category}
                                    </span>
                                    <h3 className="text-sm md:text-lg font-sans text-white font-medium tracking-tight line-clamp-1">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tüm galeriye git */}
                {portfolio.length > 4 && (
                    <div className="mt-16 text-center">
                        <Link
                            href="/portfolio"
                            className="inline-flex items-center gap-2 text-foreground border-b border-primary pb-2 text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors"
                        >
                            Tüm Çalışmaları Gör <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
