import React from 'react'
import { motion } from 'framer-motion'

export default function Stats() {
    const stats = [
        { label: "Yıllık Deneyim", value: "10+" },
        { label: "Mutlu Çift", value: "450+" },
        { label: "Ödüllü Çekim", value: "25+" },
        { label: "Profesyonel Ekip", value: "15+" }
    ]

    return (
        <section className="bg-zinc-950 py-20 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span className="text-4xl md:text-5xl font-serif text-white mb-2 tracking-tighter">
                                {stat.value}
                            </span>
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/40 font-medium">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
