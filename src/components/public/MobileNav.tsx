"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarPlus, Phone } from 'lucide-react'

export default function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-black/5 pb-safe pt-2 px-6 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between relative max-w-sm mx-auto">
                
                {/* Ana Sayfa */}
                <Link href="/" className={`flex flex-col items-center gap-1 p-2 transition-colors ${pathname === '/' ? 'text-[#D49A73]' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Ana Sayfa</span>
                </Link>

                {/* Center Action (Randevu Al) */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8">
                    <Link href="/online-rezervasyon" className="flex flex-col items-center gap-1 group">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30 transition-transform active:scale-95 ${pathname === '/online-rezervasyon' ? 'bg-[#c2845c]' : 'bg-[#D49A73] group-hover:bg-[#c2845c]'}`}>
                            <CalendarPlus className="w-6 h-6" />
                        </div>
                    </Link>
                </div>

                {/* İletişim */}
                <Link href="/contact" className={`flex flex-col items-center gap-1 p-2 transition-colors ${pathname === '/contact' ? 'text-[#D49A73]' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Phone className="w-6 h-6" />
                    <span className="text-[10px] font-bold">İletişim</span>
                </Link>
                
            </div>
            {/* Safe area spacing for iOS */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
    )
}
