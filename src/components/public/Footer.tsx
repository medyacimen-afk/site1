"use client"
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function Footer() {
    const { siteSettings, links } = useSiteSettings()

    return (
        <footer className="bg-slate-50 pt-32 pb-12 border-t border-black/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Info */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col">
                            <Link href="/">
                                <img
                                    src={siteSettings.logoUrl || '/logo.webp'}
                                    alt={siteSettings.businessName}
                                    className="h-16 w-auto object-contain mb-2"
                                />
                            </Link>
                        </div>
                        <p className="text-foreground/50 text-[13px] leading-relaxed max-w-xs font-light">
                            {siteSettings.about}
                        </p>
                        <div className="flex items-center gap-4">
                            {siteSettings.instagram && (
                                <Link href={links.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 border border-black/10 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                                    <Instagram className="w-5 h-5" />
                                </Link>
                            )}
                            {siteSettings.facebook && (
                                <Link href={links.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 border border-black/10 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                                    <Facebook className="w-5 h-5" />
                                </Link>
                            )}
                            {siteSettings.youtube && (
                                <Link href={links.youtube} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 border border-black/10 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                                    <Youtube className="w-5 h-5" />
                                </Link>
                            )}
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

                    {/* Hızlı Erişim */}
                    <div className="lg:col-span-1">
                        <h4 className="text-foreground font-serif text-xl mb-8">Hızlı Erişim</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="/online-rezervasyon" className="text-foreground/40 hover:text-primary text-sm transition-colors font-light">Randevu Al</Link></li>
                            <li><Link href="/portfolio" className="text-foreground/40 hover:text-primary text-sm transition-colors font-light">Portfolyo</Link></li>
                            <li><Link href="/about" className="text-foreground/40 hover:text-primary text-sm transition-colors font-light">Hakkımızda</Link></li>
                            <li><Link href="/blog" className="text-foreground/40 hover:text-primary text-sm transition-colors font-light">Blog</Link></li>
                            <li><Link href="/contact" className="text-foreground/40 hover:text-primary text-sm transition-colors font-light">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-foreground font-serif text-xl mb-8">İletişim</h4>
                        <ul className="flex flex-col gap-6">
                            {siteSettings.address && (
                                <li className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                                    <span className="text-foreground/40 text-[13px] font-light leading-relaxed">
                                        {siteSettings.address}
                                    </span>
                                </li>
                            )}
                            {siteSettings.phone && (
                                <li className="flex items-center gap-4">
                                    <Phone className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                                    <a href={links.phone} className="text-foreground/40 text-sm font-light hover:text-primary transition-colors">
                                        {siteSettings.phone}
                                    </a>
                                </li>
                            )}
                            {siteSettings.email && (
                                <li className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                                    <a href={links.email} className="text-foreground/40 text-sm font-light hover:text-primary transition-colors">
                                        {siteSettings.email}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <span className="text-foreground/30 text-[10px] uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} {siteSettings.businessName.toUpperCase()}. TÜM HAKLARI SAKLIDIR.
                    </span>
                    <div className="flex items-center gap-8 text-foreground/30 text-[10px] uppercase tracking-[0.2em]">
                        <Link href="/gizlilik-politikasi" className="hover:text-primary transition-colors">GİZLİLİK POLİTİKASI</Link>
                        <Link href="/kullanim-kosullari" className="hover:text-primary transition-colors">KULLANIM KOŞULLARI</Link>
                    </div>
                </div>
            </div>

        </footer>
    )
}
