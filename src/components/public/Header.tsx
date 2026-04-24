"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Hakkımızda', href: '/about' },
    { name: 'Hizmetler', href: '/#services' },
    { name: 'Portfolyo', href: '/portfolio' },
    { name: 'Klipler', href: '/videos' },
    { name: 'İletişim', href: '/contact' },
]

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
                isScrolled 
                    ? 'bg-white/90 backdrop-blur-xl border-black/5 py-4' 
                    : 'bg-transparent border-black/10 py-6'
            }`}
        >
            <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
                
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1 group">
                    <img 
                        src="/logo-suat-abi-j.webp" 
                        alt="Sivas Düğün Fotoğrafçısı®" 
                        className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className="text-foreground/70 hover:text-primary text-sm font-medium transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden lg:flex items-center">
                    <Link href="/online-rezervasyon" className="bg-primary text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-bold hover:shadow-xl transition-all shadow-lg shadow-primary/20">
                        Randevu Al
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="lg:hidden text-foreground"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/5 z-40 lg:hidden flex flex-col items-center py-8 gap-6 shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-foreground text-lg font-medium hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link 
                            href="/online-rezervasyon" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="bg-primary text-primary-foreground rounded-xl px-10 py-3 text-sm font-bold shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-all"
                        >
                            Randevu Al
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
