"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Aperture, Heart, Lightbulb, Target, PenTool, Loader2 } from 'lucide-react'
import { useContent } from '@/hooks/useContent'

const iconMap: { [key: string]: any } = { 
    Camera, Aperture, Heart, Lightbulb, Target, PenTool 
}

export default function WhyChooseUs() {
    const { features, loading } = useContent()

    if (loading || features.length === 0) return null

    return (
        <section className="py-24 bg-white overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    
                    {/* Left: 6-Grid Features */}
                    <div className="lg:col-span-12">
                        <div className="mb-16">
                            <span className="text-primary tracking-[0.4em] uppercase text-xs font-bold mb-6 block">Neden Biz?</span>
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-sans text-foreground font-medium tracking-tighter leading-tight">Aşkınızı Ölümsüz kılıyoruz.</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, idx) => {
                                const Icon = iconMap[feature.icon] || Camera
                                return (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        className={`p-10 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${feature.isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-black/5 text-foreground hover:border-primary/30 shadow-sm'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${feature.isActive ? 'bg-white/20 text-white' : 'bg-primary/5 text-primary'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-sans font-semibold mb-4 tracking-tight">{feature.title}</h3>
                                        <p className={`text-sm leading-relaxed font-light ${feature.isActive ? 'opacity-90' : 'text-foreground/60'}`}>
                                            {feature.desc}
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
