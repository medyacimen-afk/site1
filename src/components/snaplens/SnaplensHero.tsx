"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useContent } from '@/hooks/useContent'

export default function SnaplensHero() {
    const { settings, slides, loading } = useContent()
    const [current, setCurrent] = useState(0)

    // Slides otomatik değişsin
    useEffect(() => {
        if (slides.length > 1) {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slides.length)
            }, 6000)
            return () => clearInterval(timer)
        }
    }, [slides.length])

    const fallbackSlides = [
        { id: 'f1', image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920" },
        { id: 'f2', image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1920" }
    ]

    const activeSlides = slides.length > 0 ? slides : fallbackSlides

    if (loading) {
        return (
            <div className="h-[100svh] w-full bg-white flex items-center justify-center">
                 <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        )
    }

    // CMS'den veri gelmediyse fallback metinler
    const displayTitle = settings.heroTitle || "En Özel Anları Yakalıyoruz,<br/>Sizin Hikayenizi Yazıyoruz"
    const displaySubtitle = settings.heroSubtitle || "Bölgenin en çok tercih edilen düğün fotoğrafçısı olarak, en mutlu gününüzü profesyonel kadromuz ve son teknoloji ekipmanlarımızla hikayeleştiriyoruz."

    return (
        <section className="relative h-[100svh] w-full overflow-hidden flex items-center bg-white">
            
            {/* Background Image Slider */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-white/30 z-10" />
                    <img 
                        src={activeSlides[current]?.image} 
                        alt="Slider background" 
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            <div className="container mx-auto px-4 lg:px-8 z-20 h-full flex flex-col justify-center relative">
                
                {/* Text Content */}
                <div className="max-w-3xl mt-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        <span className="text-foreground/70 text-xs tracking-[0.3em] uppercase font-medium">Profesyonel Düğün Fotoğrafçısı</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        dangerouslySetInnerHTML={{ __html: displayTitle }}
                        className="text-4xl md:text-5xl lg:text-7xl font-sans font-semibold text-foreground leading-[1.2] mb-6 tracking-tight"
                    />

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-foreground/60 font-light text-sm md:text-base leading-relaxed mb-12 max-w-xl"
                    >
                        {displaySubtitle}
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex items-center gap-6"
                    >
                        <Link href="/online-rezervasyon" className="group bg-primary px-9 py-4 rounded-xl text-primary-foreground text-sm font-bold hover:shadow-2xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                            Randevu Al
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        
                        <Link href="/videos" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 border border-primary/20 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                                <Play className="w-4 h-4 ml-0.5 fill-current" />
                            </div>
                            <span className="text-foreground font-medium text-xs tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">Videoyu İzle</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Bottom Right Thumbnails Slider Control */}
                {activeSlides.length > 0 && (
                    <div className="absolute right-4 md:right-8 bottom-8 md:bottom-12 hidden md:flex flex-col items-center">
                        <div className="flex items-center gap-3">
                            {activeSlides.map((slide, idx) => (
                                <button 
                                    key={slide.id || idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`relative w-28 h-16 rounded-xl overflow-hidden transition-all duration-500 ${current === idx ? 'ring-2 ring-primary scale-105 shadow-2xl z-10 opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <img src={slide.image} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </section>
    )
}
