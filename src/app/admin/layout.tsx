"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Image as ImageIcon, Users, Briefcase, Camera, Menu, X, LogOut, Plus, ClipboardList, FileText, Settings, Package, PlayCircle } from 'lucide-react'
import { Toaster } from 'sonner'

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Hero Ayarları', href: '/admin/hero', icon: ImageIcon },
    { name: 'Paketler & Ekstralar', href: '/admin/services', icon: Package },
    { name: 'Neden Biz', href: '/admin/features', icon: Briefcase },
    { name: 'Portfolyo', href: '/admin/portfolio', icon: Camera },
    { name: 'Düğün Klipleri', href: '/admin/videos', icon: PlayCircle },
    { name: 'Ekibimiz', href: '/admin/team', icon: Users },
    { name: 'Blog Yazıları', href: '/admin/blog', icon: FileText },
    { name: 'Rezervasyonlar', href: '/admin/bookings', icon: ClipboardList },
    { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#F4F4F5] flex overflow-hidden">
            
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-xl z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 flex flex-col`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-black/5">
                    <span className="font-serif font-black text-xl tracking-tight text-black">SDF <span className="text-[#D49A73]">Admin</span></span>
                    <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className="group flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-black transition-colors"
                            >
                                <item.icon className="w-5 h-5 opacity-70" />
                                <span className="font-semibold text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t">
                    <button className="flex items-center w-full gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <div className="flex-1 flex flex-col w-full min-w-0 h-screen overflow-hidden">
                
                {/* Topbar */}
                <header className="h-16 bg-white shadow-sm flex items-center px-4 lg:px-8 justify-between z-10 shrink-0">
                    <button 
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900 leading-none mb-1">Admin Panel</span>
                            <span className="text-[10px] italic text-gray-500">Yönetici Modülü</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#D49A73] text-white flex items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                    <Toaster position="bottom-right" richColors />
                </main>
            </div>
            
        </div>
    )
}
