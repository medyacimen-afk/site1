"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

export default function Testimonials() {
    const reviews = [
        {
            name: "Elif & Ahmet",
            text: "Hayatımızın en özel gününü bu harika ekibe emanet ettiğimiz için çok mutluyuz. Çekimler boyunca bizi o kadar rahat hissettirdiler ki, ortaya çıkan sonuçlar hayal ettiğimizden de güzel oldu.",
            role: "Düğün Çekimi"
        },
        {
            name: "Merve & Can",
            text: "Dış çekim kliplerimiz adeta bir film sahnesi gibi! Profesyonellikleri ve güler yüzleri çekimi çok keyifli hale getirdi. Kesinlikle tavsiye ediyoruz.",
            role: "Dış Çekim & Klip"
        },
        {
            name: "Selin & Murat",
            text: "Ekip hem çok yaratıcı hem de çok disiplinli. Şehirde fark yaratan tek adres diyebilirim. Albümlerimiz elimize ulaştığında kalitesine hayran kaldık.",
            role: "Nişan Çekimi"
        }
    ]

    return (
        <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4 text-center">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-white/40 tracking-[0.3em] uppercase text-[10px] mb-4 block"
                >
                    Mutlu Çiftlerimiz
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-serif text-white mb-20"
                >
                    Aşk Hikayenize <span className="italic">Tanıklık Ediyoruz</span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="flex flex-col items-center px-6"
                        >
                            <div className="mb-8 p-4 rounded-full bg-white/5 border border-white/10 text-white/40">
                                <Quote className="w-8 h-8" />
                            </div>
                            <p className="text-white/70 italic font-light leading-relaxed mb-8 text-lg">
                                "{review.text}"
                            </p>
                            <div className="flex flex-col items-center">
                                <span className="text-white font-serif text-xl mb-1">{review.name}</span>
                                <span className="text-[10px] uppercase tracking-widest text-white/30">{review.role}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
