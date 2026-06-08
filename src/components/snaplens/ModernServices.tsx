"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useContent } from '@/hooks/useContent'

export default function ModernServices() {
    const { services, loading } = useContent()

    if (loading || services.length === 0) return null

    const fmt = (n: any) => Number(n || 0).toLocaleString('tr-TR')

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-xl">
                        <span className="text-primary tracking-[0.4em] uppercase text-xs font-bold mb-4 block">Hizmetlerimiz</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans text-foreground font-medium tracking-tight">İhtiyaçlarınıza Uygun <br/> Seçenekler</h2>
                    </div>
                    <Link
                        href="/online-rezervasyon"
                        className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-primary border-b border-primary/40 hover:border-primary pb-1 transition-colors shrink-0"
                    >
                        Tüm Paketleri Gör <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service: any, idx: number) => {
                        const hasDiscount = service.discountedPrice && Number(service.discountedPrice) > 0
                        const finalPrice = hasDiscount ? service.discountedPrice : service.price
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-[2.5rem] bg-slate-100"
                            >
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                                />

                                {/* İndirim rozeti */}
                                {hasDiscount && (
                                    <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-primary/30">
                                        <Sparkles className="w-3.5 h-3.5" /> Fırsat
                                    </div>
                                )}

                                {/* İçerik Overlay */}
                                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent">
                                    <h3 className="text-3xl md:text-4xl font-sans font-medium text-white mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 tracking-tight">
                                        {service.title}
                                    </h3>
                                    <p className="text-white/60 text-sm md:text-base max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 leading-relaxed font-light mb-5 line-clamp-3">
                                        {service.description}
                                    </p>

                                    <div className="flex items-end justify-between gap-4">
                                        {/* Fiyat */}
                                        <div className="flex flex-col">
                                            {hasDiscount && (
                                                <span className="text-white/40 text-sm line-through leading-none mb-1">{fmt(service.price)} ₺</span>
                                            )}
                                            {Number(finalPrice) > 0 ? (
                                                <span className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                                    {fmt(finalPrice)} <span className="text-lg font-medium">₺</span>
                                                </span>
                                            ) : (
                                                <span className="text-white/80 text-lg font-semibold">Fiyat için iletişime geçin</span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href="/online-rezervasyon"
                                            className="shrink-0 inline-flex items-center gap-2 bg-white/95 hover:bg-primary hover:text-white text-slate-900 text-sm font-bold px-5 py-3 rounded-full transition-all shadow-lg backdrop-blur-sm"
                                        >
                                            Rezervasyon <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Mobil CTA */}
                <div className="mt-12 text-center md:hidden">
                    <Link
                        href="/online-rezervasyon"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-8 py-4 rounded-full shadow-lg shadow-primary/25"
                    >
                        Tüm Paketleri Gör <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
