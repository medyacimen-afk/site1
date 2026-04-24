"use client"
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-slate-50 pt-32 pb-12 border-t border-black/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Info */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col">
                            <Link href="/">
                                <img 
                                    src="/logo-suat-abi-j.webp" 
                                    alt="Sivas Düğün Fotoğrafçısı®" 
                                    className="h-16 w-auto object-contain mb-2"
                                />
                            </Link>
                            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Tescilli Marka ®</span>
                        </div>
                        <p className="text-foreground/50 text-[13px] leading-relaxed max-w-xs font-light">
                            Sivas'ın marka tescilli tek düğün fotoğrafçılığı markası olarak, 10 yılı aşkın tecrübemizle en özel anlarınızı ölümsüzleştiriyoruz. Taklitlerimizden sakınınız.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="https://instagram.com/sivasdugunfotografcisi" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 border border-black/10 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="https://facebook.com/sivasdugunfotografcisi" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 border border-black/10 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="https://youtube.com/@sivasdugunfotografcisi" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 border border-black/10 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                                <Youtube className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-foreground font-serif text-xl mb-8">Kurumsal</h4>
                        <ul className="flex flex-col gap-4">
                            {['Ana Sayfa', 'Hakkımızda', 'Portfolyo', 'Blog', 'Rezervasyon'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-foreground/40 hover:text-primary text-sm transition-colors font-light">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Orijinal - Güvenlik Uyarısı */}
                    <div className="lg:col-span-1">
                        <h4 className="text-foreground font-serif text-xl mb-8 flex items-center gap-2">
                             Marka Denetimi
                        </h4>
                        <div className="p-6 bg-primary/[0.03] rounded-[2rem] border border-primary/10 relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            {/* Visual Seal / Badge */}
                            <div className="absolute top-4 right-4 w-16 h-16 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-2 border border-primary/60 rounded-full flex flex-col items-center justify-center text-primary">
                                    <span className="text-[6px] font-bold uppercase tracking-tighter decoration-primary/30 underline decoration-dotted mb-0.5">Tescilli</span>
                                    <span className="text-sm font-bold leading-none">®</span>
                                    <span className="text-[4px] font-bold uppercase tracking-widest mt-0.5">Patent</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-[12px] text-foreground/60 leading-relaxed font-light">
                                    <strong className="text-primary font-bold block mb-2 uppercase tracking-tighter italic">Resmî Marka Tescili®</strong>
                                    Sivas Düğün Fotoğrafçısı® tescilli bir markadır. Google, Instagram ve YouTube üzerinde ismimizi izinsiz kullanan yetkisiz hesaplara karşı **olası dolandırıcılık konularında** dikkatli olunuz. Sivas'ın tek tescilli markasıdır.
                                </p>
                                <div className="mt-4 pt-4 border-t border-primary/5">
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">— Resmî Kanal: @sivasdugunfotografcisi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-foreground font-serif text-xl mb-8">İletişim</h4>
                        <ul className="flex flex-col gap-6">
                            <li className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                                <span className="text-foreground/40 text-[13px] font-light leading-relaxed">
                                    Camii Kebir Mah. Selçuklu Sok. Yeşil Rize Apt. Kat 1 No: 3 <br />
                                    Merkez, Sivas (Çifte Minareli Medrese Yanı)
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                                <span className="text-foreground/40 text-sm font-light">
                                    <a href="tel:+905324071563" className="hover:text-primary transition-colors">0532 407 15 63</a>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                                <span className="text-foreground/40 text-sm font-light">
                                    <a href="mailto:sivasdugunfotografcisi@gmail.com" className="hover:text-primary transition-colors">sivasdugunfotografcisi@gmail.com</a>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <span className="text-foreground/30 text-[10px] uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} SİVAS DÜĞÜN FOTOĞRAFÇISI®. TÜM HAKLARI SAKLIDIR.
                    </span>
                    <div className="flex items-center gap-8 text-foreground/30 text-[10px] uppercase tracking-[0.2em]">
                        <Link href="#" className="hover:text-primary transition-colors">GİZLİLİK POLİTİKASI</Link>
                        <Link href="#" className="hover:text-primary transition-colors">KULLANIM KOŞULLARI</Link>
                    </div>
                </div>
            </div>

        </footer>
    )
}
