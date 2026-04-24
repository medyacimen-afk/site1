"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CalendarIcon, ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                    alt="Sivas Düğün Fotoğrafçısı"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
            </div>

            <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <span className="inline-block text-white/70 tracking-[0.3em] uppercase text-xs mb-6 font-medium">
                        Sivas'ın En Prestijli Fotoğraf Stüdyosu
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif text-white leading-tight mb-8">
                        Aşkınızın En <br />
                        <span className="italic">Zarif Hikayesi</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                >
                    Sivas Düğün Fotoğrafçısı olarak, en özel anlarınızı sinematik bir estetikle ölümsüzleştiriyoruz. Her karede bir hikaye, her hikayede sonsuz bir aşk.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link href="/reservation" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full h-16 px-10 text-base rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-medium border-none shadow-2xl">
                            <CalendarIcon className="mr-2 h-5 w-5" />
                            Randevu Al
                        </Button>
                    </Link>
                    <Link href="/portfolio" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full h-16 px-10 text-base rounded-full text-white border-white/30 hover:bg-white/10 transition-all font-medium backdrop-blur-sm">
                            <ImageIcon className="mr-2 h-5 w-5" />
                            Portfolyo
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
            >
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Kaydırın</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
            </motion.div>
        </section>
    )
}
