"use client"
import React, { useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

import SnaplensHero from '@/components/snaplens/SnaplensHero'
import AboutSection from '@/components/snaplens/AboutSection'
import WhyChooseUs from '@/components/snaplens/WhyChooseUs'
import ModernServices from '@/components/snaplens/ModernServices'
import TeamSection from '@/components/snaplens/TeamSection'
import PortfolioGrid from '@/components/snaplens/PortfolioGrid'

export default function Home() {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="bg-white min-h-screen text-foreground overflow-hidden">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Birebir Tasarım Bölümleri */}
            <SnaplensHero />
            <AboutSection />
            <WhyChooseUs />
            <ModernServices />
            <TeamSection />
            <PortfolioGrid />

            {/* Final CTA Section (Opsiyonel - İletişim için) */}
            <section className="py-32 bg-slate-50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-[0.05] grayscale" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-primary tracking-[0.4em] uppercase text-xs mb-6 block font-medium">Hayallerinizi Ölümsüzleştirin</span>
                        <h2 className="text-4xl md:text-6xl font-sans text-foreground mb-10 tracking-tight leading-tight font-medium">
                            Aşkınızı Çerçevelemek İçin <br />
                            Bizimle İletişime Geçin
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground text-sm font-semibold transition-all shadow-xl hover:shadow-2xl"
                            >
                                Rezervasyon Yap
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
