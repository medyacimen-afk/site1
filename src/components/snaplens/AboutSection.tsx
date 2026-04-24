"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Briefcase, ThumbsUp, Camera } from 'lucide-react'
import { useContent } from '@/hooks/useContent'

export default function AboutSection() {
    const { settings, loading } = useContent()
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const y1 = useTransform(scrollYProgress, [0, 1], [80, -80])
    const y2 = useTransform(scrollYProgress, [0, 1], [-80, 80])

    const displayAboutTitle = settings.aboutTitle || "Mercekten Bakarak <br class='hidden md:block'/> Aşkın Dünyasını Keşfedin"
    const displayAboutDesc = settings.aboutDesc || "En mutlu gününüzde, en doğal ve içten anlarınızı profesyonel bakış açımızla ölümsüzleştiriyoruz. Yılların tecrübesi ve son teknoloji ekipmanlarımızla hikayenizi yazıyoruz."

    return (
        <section id="about" ref={sectionRef} className="py-32 bg-white text-foreground relative flex items-center overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    
                    <div className="relative h-[600px] w-full flex justify-center items-center gap-6">
                        <motion.div style={{ y: y1 }} className="w-[280px] md:w-[320px] h-[400px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl relative mt-32">
                            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600" alt="Photography 1" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.div style={{ y: y2 }} className="w-[280px] md:w-[320px] h-[400px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl relative mb-32">
                            <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600" alt="Photography 2" className="w-full h-full object-cover" />
                        </motion.div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="flex items-center gap-2 mb-6">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="text-foreground/70 text-sm tracking-widest uppercase font-medium">Hakkımızda</span>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }}
                            dangerouslySetInnerHTML={{ __html: displayAboutTitle }}
                            className="text-4xl md:text-5xl font-sans font-medium text-foreground leading-[1.3] mb-6 tracking-tight"
                        />

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}
                            className="text-foreground/60 font-light text-sm md:text-base leading-relaxed mb-12 max-w-lg"
                        >
                            {displayAboutDesc}
                        </motion.p>

                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12">
                            <div className="bg-white rounded-2xl p-6 flex flex-col justify-center gap-3 hover:shadow-2xl transition-all border border-black/5 shadow-xl shadow-black/5">
                                <div className="flex items-center gap-4">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                    <span className="text-3xl font-semibold text-foreground">{settings.stat1Value || "10+"}</span>
                                </div>
                                <span className="text-foreground/40 text-[10px] uppercase tracking-widest font-bold">{settings.stat1Label || "Yıllık Tecrübe"}</span>
                            </div>

                            <div className="bg-white rounded-2xl p-6 flex flex-col justify-center gap-3 hover:shadow-2xl transition-all border border-black/5 shadow-xl shadow-black/5">
                                <div className="flex items-center gap-4">
                                    <ThumbsUp className="w-6 h-6 text-primary" />
                                    <span className="text-3xl font-semibold text-foreground">{settings.stat2Value || "450+"}</span>
                                </div>
                                <span className="text-foreground/40 text-[10px] uppercase tracking-widest font-bold">{settings.stat2Label || "Mutlu Çiftler"}</span>
                            </div>

                            <div className="bg-white rounded-2xl p-6 flex flex-col justify-center gap-3 hover:shadow-2xl transition-all border border-black/5 shadow-xl shadow-black/5">
                                <div className="flex items-center gap-4">
                                    <Camera className="w-6 h-6 text-primary" />
                                    <span className="text-3xl font-semibold text-foreground">{settings.stat3Value || "900+"}</span>
                                </div>
                                <span className="text-foreground/40 text-[10px] uppercase tracking-widest font-bold">{settings.stat3Label || "Özel Çekim"}</span>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} viewport={{ once: true }}>
                            <Link href="/about" className="group bg-primary text-primary-foreground px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-2xl transition-all inline-block shadow-lg shadow-primary/20">
                                Hikayemizi Gör
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
