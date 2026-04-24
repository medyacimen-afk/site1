"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Award, Camera, Users, Heart } from 'lucide-react'

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white pt-40 pb-24">
            <div className="container mx-auto px-4">
                {/* Hero section for About */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-foreground/40 tracking-[0.4em] uppercase text-[10px] mb-6 block font-medium">Hikayemiz</span>
                        <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-8 leading-tight tracking-tight">
                            Sivas'ın İlk ve <br />
                            <span className="italic">Tek Markalı Stüdyosu</span>
                        </h1>
                        <p className="text-foreground/60 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-xl">
                            10 yılı aşkın süredir, Sivas'ta aşkın en doğal ve zarif hallerini vizörümüzden geleceğe taşıyoruz. Biz sadece fotoğraf çekmiyoruz; sizin en değerli anılarınızı birer sanat eserine dönüştürüyoruz.
                        </p>
                        <div className="flex items-center gap-12">
                            <div className="flex flex-col">
                                <span className="text-4xl font-serif text-foreground mb-1">10+</span>
                                <span className="text-[10px] uppercase tracking-widest text-foreground/30">Yıllık Deneyim</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-serif text-foreground mb-1">4500+</span>
                                <span className="text-[10px] uppercase tracking-widest text-foreground/30">Mutlu Çift</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                            <img
                                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop"
                                alt="Sivas Düğün Fotoğrafçısı Team"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 backdrop-blur-3xl rounded-full -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 backdrop-blur-3xl rounded-full -z-10" />
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="py-24 border-y border-black/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                        {[
                            { icon: <Award className="w-8 h-8" />, title: "Kurumsallık", text: "Sivas'ın marka tescilli tek stüdyosu olarak profesyonel hizmet sunuyoruz." },
                            { icon: <Camera className="w-8 h-8" />, title: "Teknoloji", text: "En son teknoloji ekipmanlar ve sinematik bakış açısıyla çekimlerimizi yapıyoruz." },
                            { icon: <Users className="w-8 h-8" />, title: "Memnuniyet", text: "Yıllık 450'den fazla çiftin mutluluğuna ortak oluyor, %100 memnuniyet hedefliyoruz." },
                            { icon: <Heart className="w-8 h-8" />, title: "Tutku", text: "İlk günkü fotoğrafçılık heyecanımızı ve aşkımızı her kareye yansıtıyoruz." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col items-center text-center p-8 rounded-3xl border border-black/5 hover:bg-slate-50 transition-all"
                            >
                                <div className="mb-6 p-4 rounded-full bg-slate-100 text-primary border border-black/5">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-serif text-foreground mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-sm text-foreground/40 leading-relaxed font-light">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Our Approach */}
                <div className="py-32 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 md:order-1"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                            alt="The Studio Atmos"
                            className="rounded-3xl shadow-2xl"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 md:order-2"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-8 tracking-tight">
                            Sorunsuz <span className="italic">Profesyonellik</span>
                        </h2>
                        <p className="text-foreground/60 text-lg font-light leading-relaxed mb-6">
                            Bizim için en önemli öncelik, çekim gününü sizin için stressiz ve keyifli bir deneyime dönüştürmektir. Planlamadan albüm teslimatına kadar her aşamada şeffaf ve kurumsal bir yaklaşımla yanınızdayız.
                        </p>
                        <p className="text-foreground/60 text-lg font-light leading-relaxed mb-10">
                            Sizin tarzınıza ve bitiş dileğinize göre özelleştirilmiş paketlerimizle, hayalinizdeki düğün hikayesini gerçeğe dönüştürüyoruz.
                        </p>
                        <div className="w-12 h-[1px] bg-primary/40" />
                    </motion.div>
                </div>
            </div>
        </main>
    )
}
