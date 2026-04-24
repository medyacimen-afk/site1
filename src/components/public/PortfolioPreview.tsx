"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function PortfolioPreview() {
    const images = [
        { url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop", title: "Dış Çekim", alt: "Sunset Wedding" },
        { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop", title: "Düğün Hikayesi", alt: "Bride Portrait" },
        { url: "https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=2070&auto=format&fit=crop", title: "Nişan", alt: "Engagement Couple" },
        { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop", title: "Gelinlik", alt: "Wedding Dress" },
        { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop", title: "Sünnet", alt: "Family Photo" },
        { url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop", title: "Stüdyo", alt: "Professional Portrait" }
    ]

    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-white/40 tracking-[0.3em] uppercase text-[10px] mb-4 block"
                        >
                            İz Bırakan Anlar
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl md:text-5xl font-serif text-white tracking-tight"
                        >
                            Sizin İçin <span className="italic text-white/70">Ölümsüzleştirdiklerimiz</span>
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/portfolio">
                            <Button variant="outline" className="rounded-full h-14 px-8 border-white/20 text-white hover:bg-white hover:text-black transition-all group font-serif italic text-lg tracking-wide">
                                Tüm Galeriyi İncele
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {images.map((image, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="group relative overflow-hidden rounded-2xl break-inside-avoid"
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
                            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 group-hover:scale-100">
                                <span className="text-white/60 tracking-[0.2em] uppercase text-[10px] mb-2">{image.title}</span>
                                <div className="w-12 h-[1px] bg-white/40 mb-4" />
                                <span className="text-white text-xl font-serif italic">Görüntüle</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
