"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Video, Image as ImageIcon, Users } from 'lucide-react'

export default function Services() {
    const services = [
        {
            title: "Düğün Hikayesi",
            description: "En mutlu gününüzü sabahın ilk ışıklarından gecenin sonuna kadar tüm detaylarıyla kaydediyoruz.",
            icon: <Camera className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
        },
        {
            title: "Dış Çekim & Klip",
            description: "Hayalinizdeki atmosferde, size özel mekanlarda profesyonel sinematik çekimler.",
            icon: <Video className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Nişan & Söz Çekimi",
            description: "Aşkınızın ilk resmi adımlarını en samimi ve doğal karelerle belgeliyoruz.",
            icon: <Users className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Sünnet & Özel Gün",
            description: "Ailenizin en değerli anlarını profesyonel bir bakış açısıyla geleceğe taşıyoruz.",
            icon: <ImageIcon className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
        }
    ]

    return (
        <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-white/50 tracking-[0.3em] uppercase text-[10px] mb-4"
                    >
                        Neler Yapıyoruz?
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif text-white mb-6"
                    >
                        Premium <span className="italic">Servislerimiz</span>
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-12 h-[1px] bg-white/20"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="group relative h-[450px] overflow-hidden rounded-2xl cursor-pointer"
                        >
                            {/* Background Image */}
                            <img
                                src={service.image}
                                alt={service.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500" />

                            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center text-center">
                                <div className="mb-4 p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 group-hover:bg-white group-hover:text-black transition-colors duration-500">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-serif text-white mb-3 tracking-tight">
                                    {service.title}
                                </h3>
                                <p className="text-xs text-white/50 line-clamp-2 max-w-[200px] leading-relaxed transition-all duration-500 group-hover:text-white/80">
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
