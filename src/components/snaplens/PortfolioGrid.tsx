"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { useContent } from '@/hooks/useContent'

export default function PortfolioGrid() {
    const { portfolio, loading } = useContent()

    const homeItems = portfolio.filter(item => item.isHome).length > 0
        ? portfolio.filter(item => item.isHome).slice(0, 6)
        : portfolio.slice(0, 4)

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {homeItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-slate-100">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0 opacity-80 group-hover:opacity-100"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity" />
                                
                                <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transform translate-x-4 translate-y-[-4] opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>

                                <div className="absolute bottom-10 left-10">
                                    <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-3 block">
                                        {item.category}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-sans text-white font-medium tracking-tight">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Görsel Sıklığına Göre Buton */}
                {portfolio.length > 4 && (
                    <div className="mt-16 text-center">
                        <button className="text-foreground border-b border-primary pb-2 text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors">
                            Tüm Çalışmaları Gör
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
