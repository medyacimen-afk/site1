"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useContent } from '@/hooks/useContent'

export default function TeamSection() {
    const { team, loading } = useContent()

    if (loading || team.length === 0) return null

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Team Photos Grid */}
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            {team.slice(0, 2).map((member, idx) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: idx * 0.2 }}
                                    className={`relative rounded-3xl overflow-hidden aspect-[3/4] ${idx === 1 ? 'mt-12' : ''}`}
                                >
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6">
                                        <h4 className="text-white font-bold text-lg">{member.name}</h4>
                                        <p className="text-primary text-xs uppercase tracking-widest font-medium mt-1">{member.role}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Decorative Element */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/5 rounded-full pointer-events-none" />
                    </div>

                    {/* Content */}
                    <div className="lg:pl-12">
                        <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-primary tracking-[0.4em] uppercase text-xs font-bold mb-6 block"
                        >
                            Ekibimizle Tanışın
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-sans text-foreground font-medium mb-8 tracking-tighter leading-[1.1]"
                        >
                            En Özel Anlarınızı <br />
                            <span className="text-foreground/30">Kusursuzlaştıran</span> <br />
                            Profesyonel Eller
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-foreground/60 font-light leading-relaxed mb-10 max-w-md text-sm md:text-base"
                        >
                            Alanında uzman fotoğrafçı ve sinematograf kadromuzla, her detayı titizlikle planlıyor ve aşkınızı en estetik şekilde kadraja sığdırıyoruz. 
                        </motion.p>
                        
                        <Link
                            href="/contact"
                            className="inline-block border border-primary/20 text-primary px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                        >
                            Bizimle Çalışın
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    )
}
