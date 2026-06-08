"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function ContactPage() {
    const { siteSettings, links } = useSiteSettings()
    return (
        <main className="min-h-screen bg-white pt-40 pb-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-foreground/40 tracking-[0.4em] uppercase text-[10px] mb-4"
                    >
                        Bize Ulaşın
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif text-foreground mb-6 leading-tight tracking-tight"
                    >
                        Hikayenizi <span className="italic">Birlikte Yazalım</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-foreground/50 max-w-2xl font-light text-lg"
                    >
                        En özel gününüzü planlamak veya aklınızdaki soruları sormak için bize dilediğiniz kanaldan ulaşabilirsiniz.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="bg-slate-50 p-10 md:p-16 rounded-3xl border border-black/5"
                    >
                        <h2 className="text-3xl font-serif text-foreground mb-10 tracking-tight">Teklif ve Bilgi Alın</h2>
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Ad Soyad</label>
                                    <Input 
                                        placeholder="İsminiz" 
                                        className="h-14 bg-white border-black/5 rounded-full px-8 focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-foreground/40 ml-4">E-Posta</label>
                                    <Input 
                                        type="email" 
                                        placeholder="E-Posta Adresiniz" 
                                        className="h-14 bg-white border-black/5 rounded-full px-8 focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Konu</label>
                                <Input 
                                    placeholder="Nasıl Yardımcı Olabiliriz?" 
                                    className="h-14 bg-white border-black/5 rounded-full px-8 focus:border-primary transition-all text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Mesajınız</label>
                                <Textarea 
                                    placeholder="Mesajınızı buraya yazın..." 
                                    className="min-h-[200px] bg-white border-black/5 rounded-3xl px-8 py-6 focus:border-primary transition-all text-foreground resize-none"
                                />
                            </div>
                            <Button className="w-full h-16 rounded-full bg-primary text-white hover:shadow-xl text-lg font-serif italic tracking-wide transition-all">
                                <Send className="mr-3 h-5 w-5" />
                                Mesajı Gönder
                            </Button>
                        </form>
                    </motion.div>

                    {/* Contact Info & Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-16"
                    >
                        <div className="space-y-12">
                            <h2 className="text-3xl font-serif text-foreground tracking-tight">İletişim Bilgilerimiz</h2>
                            
                            <div className="flex items-start gap-8">
                                <div className="p-5 rounded-3xl bg-slate-50 border border-black/5 text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-serif text-xl mb-2">Adresimiz</h4>
                                    <p className="text-foreground/50 font-light leading-relaxed">
                                        {siteSettings.address || 'Adres bilgisi için admin panelini kullanın'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-8">
                                <div className="p-5 rounded-3xl bg-slate-50 border border-black/5 text-primary">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-serif text-xl mb-2">Telefon</h4>
                                    <a href={links.phone} className="text-foreground/50 font-light leading-relaxed hover:text-primary transition-colors">
                                        {siteSettings.phone || 'Telefon girilmedi'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-8">
                                <div className="p-5 rounded-3xl bg-slate-50 border border-black/5 text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-serif text-xl mb-2">E-Posta</h4>
                                    <a href={links.email} className="text-foreground/50 font-light leading-relaxed hover:text-primary transition-colors">
                                        {siteSettings.email || 'E-posta girilmedi'}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp CTA */}
                        <div className="p-10 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-6 mb-8 text-emerald-400">
                                <MessageCircle className="w-10 h-10" />
                                <h3 className="text-2xl font-serif">Hızlı Bilgi Hattı</h3>
                            </div>
                            <p className="text-emerald-400/60 mb-8 font-light">WhatsApp üzerinden anında fiyat bilgisi ve müsaitlik durumu alabilirsiniz.</p>
                            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button className="w-full h-14 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-semibold">
                                    WhatsApp'tan Bize Yazın
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    )
}
