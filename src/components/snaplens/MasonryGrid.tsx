"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const portfolioImages = [
    { id: 1, src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop", span: "md:col-span-2 md:row-span-2" },
    { id: 2, src: "https://images.unsplash.com/photo-1544078755-9a8ff4b104ae?q=80&w=1200&auto=format&fit=crop", span: "col-span-1 row-span-1" },
    { id: 3, src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop", span: "col-span-1 row-span-1" },
    { id: 4, src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop", span: "col-span-1 row-span-2" },
    { id: 5, src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop", span: "md:col-span-2 row-span-1" },
]

export default function MasonryGrid() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-8">
                {/* Header */}
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tighter">
                            Seçili İşler
                        </h2>
                        <p className="text-foreground/50 mt-4 text-sm font-light max-w-md">
                            Son yıllarda imza attığımız, hikayeleriyle öne çıkan en özel anlar.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/portfolio" className="text-foreground uppercase tracking-[0.2em] text-xs pb-1 border-b border-primary hover:text-primary transition-all font-semibold">
                            Tümünü İncele
                        </Link>
                    </motion.div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[auto] gap-4 auto-rows-[250px]">
                    {portfolioImages.map((img, idx) => (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className={`relative overflow-hidden group ${img.span}`}
                        >
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                            <img
                                src={img.src}
                                alt="Portfolio entry"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                loading="lazy"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
