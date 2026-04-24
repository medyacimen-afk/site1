"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { useContent } from '@/hooks/useContent'

export default function ModernServices() {
    const { services, loading } = useContent()

    if (loading || services.length === 0) return null

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-xl">
                        <span className="text-primary tracking-[0.4em] uppercase text-xs font-bold mb-4 block">Hizmetlerimiz</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans text-foreground font-medium tracking-tight">İhtiyaçlarınıza Uygun <br/> Seçenekler</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service, idx) => (
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
                            
                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent">
                                <h3 className="text-3xl md:text-4xl font-sans font-medium text-white mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 tracking-tight">
                                    {service.title}
                                </h3>
                                <p className="text-white/60 text-sm md:text-base max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 leading-relaxed font-light">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
