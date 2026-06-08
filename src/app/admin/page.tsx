"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Users, Image as ImageIcon, Briefcase, Loader2, Wallet, TrendingUp, Clock, CheckCircle2, XCircle, BarChart3, ChevronRight, Wrench } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, getCountFromServer } from 'firebase/firestore'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState([
        { title: "Hero Slaytları", value: "0", icon: ImageIcon, color: "bg-blue-100 text-blue-600", link: "/admin/hero" },
        { title: "Portfolyo Görselleri", value: "0", icon: Camera, color: "bg-orange-100 text-[#D49A73]", link: "/admin/portfolio" },
        { title: "Hizmetler", value: "0", icon: Briefcase, color: "bg-green-100 text-green-600", link: "/admin/services" },
        { title: "Ekip Üyeleri", value: "0", icon: Users, color: "bg-purple-100 text-purple-600", link: "/admin/team" },
    ])
    const [finance, setFinance] = useState({
        totalEarned: 0,
        pendingRevenue: 0,
        approvedCount: 0,
        pendingCount: 0,
        cancelledCount: 0
    })
    const [recentBookings, setRecentBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const [heroCount, portfolioCount, servicesCount, teamCount, bookingsSnap] = await Promise.all([
                getCountFromServer(collection(db, 'hero_slides')),
                getCountFromServer(collection(db, 'portfolio')),
                getCountFromServer(collection(db, 'services')),
                getCountFromServer(collection(db, 'team')),
                getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')))
            ])

            setStats([
                { title: "Hero Slaytları", value: heroCount.data().count.toString(), icon: ImageIcon, color: "bg-blue-50 text-blue-500", link: "/admin/hero" },
                { title: "Portfolyo Görselleri", value: portfolioCount.data().count.toString(), icon: Camera, color: "bg-orange-50 text-[#D49A73]", link: "/admin/portfolio" },
                { title: "Hizmetler", value: servicesCount.data().count.toString(), icon: Briefcase, color: "bg-emerald-50 text-emerald-600", link: "/admin/services" },
                { title: "Ekip Üyeleri", value: teamCount.data().count.toString(), icon: Users, color: "bg-purple-50 text-purple-600", link: "/admin/team" },
            ])

            let earned = 0;
            let pending = 0;
            let approvedC = 0;
            let pendingC = 0;
            let cancelledC = 0;

            bookingsSnap.docs.forEach(doc => {
                const data = doc.data()
                const amount = Number(data.totalAmount) || 0
                if (data.status === 'approved') {
                    earned += amount
                    approvedC++
                } else if (data.status === 'cancelled') {
                    cancelledC++
                } else {
                    pending += amount
                    pendingC++
                }
            })

            setFinance({
                totalEarned: earned,
                pendingRevenue: pending,
                approvedCount: approvedC,
                pendingCount: pendingC,
                cancelledCount: cancelledC
            })

            setRecentBookings(bookingsSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() })))

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif font-black tracking-tight text-gray-900">Yönetim Paneli</h1>
                    <p className="text-gray-500 italic text-sm">Tüm içerikleri buradan yönetin.</p>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-5 py-2.5 rounded-full border border-black/5 shadow-sm">
                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Kurulum sihirbazı bandı */}
            <Link href="/kurulum">
                <div className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer hover:opacity-90 transition-all"
                    style={{ background: 'linear-gradient(135deg, #FBF6EC, #f5ede0)', borderColor: 'rgba(176,144,80,0.3)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #CAAE78, #B09050)' }}>
                            <Wrench className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Kurulum Sihirbazı</p>
                            <p className="text-xs text-gray-500">Firebase ve Vercel ortam değişkenlerini yapılandırın</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
            </Link>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <Link href={stat.link} key={idx}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md hover:border-[#D49A73]/20 transition-all cursor-pointer"
                        >
                            <div className={`p-4 rounded-2xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                <p className="text-3xl font-serif font-black text-gray-900 tracking-tight">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-300 ml-2" /> : stat.value}
                                </p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Finansal Özet - Premium Kartlar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Wallet className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            <TrendingUp className="w-4 h-4" /> Toplam Kazanılan
                        </div>
                        <div className="text-4xl font-serif font-black text-gray-900">
                            {finance.totalEarned.toLocaleString('tr-TR')} <span className="text-lg">TL</span>
                        </div>
                        <p className="text-xs text-gray-400 italic font-medium">{finance.approvedCount} Onaylı Rezervasyon</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-[#D49A73]">
                        <BarChart3 className="w-24 h-24" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D49A73]">
                            <Clock className="w-4 h-4" /> Bekleyen Ödemeler
                        </div>
                        <div className="text-4xl font-serif font-black text-gray-900">
                            {finance.pendingRevenue.toLocaleString('tr-TR')} <span className="text-lg">TL</span>
                        </div>
                        <p className="text-xs text-gray-400 italic font-medium">{finance.pendingCount} Bekleyen Talep</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-3xl p-4 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tighter">Onaylı</span>
                        <span className="text-2xl font-serif font-black text-emerald-900">{finance.approvedCount}</span>
                    </div>
                    <div className="bg-red-50 rounded-3xl p-4 flex flex-col items-center justify-center text-center">
                        <XCircle className="w-6 h-6 text-red-600 mb-2" />
                        <span className="text-[10px] font-black text-red-800 uppercase tracking-tighter">İptal</span>
                        <span className="text-2xl font-serif font-black text-red-900">{finance.cancelledCount}</span>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                {/* Son Rezervasyonlar - User wants to see 'Who, What' */}
                <div className="lg:col-span-8 bg-white shadow-sm rounded-[2.5rem] border border-black/5 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                             Son Aktivite
                        </h2>
                        <Link href="/admin/bookings" className="text-xs font-black text-[#D49A73] uppercase tracking-widest hover:underline flex items-center gap-1">
                            Tümünü Gör <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentBookings.map((booking, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-black/5 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FFF9E5] group-hover:text-[#D49A73] transition-colors font-black">
                                        {(booking.brideName || booking.clientName || 'M').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">
                                            {booking.brideName} {booking.groomName ? `& ${booking.groomName}` : ''}
                                            {(!booking.brideName && booking.clientName) && booking.clientName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                            {booking.date ? format(new Date(booking.date), 'd MMMM yyyy', { locale: tr }) : 'Tarih Yok'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-serif font-black text-gray-900">{(booking.totalAmount || 0).toLocaleString('tr-TR')} TL</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${booking.status === 'approved' ? 'text-emerald-500' : booking.status === 'cancelled' ? 'text-red-500' : 'text-orange-500'}`}>
                                        {booking.status === 'approved' ? 'Tamamlandı' : booking.status === 'cancelled' ? 'İptal' : 'Beklemede'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentBookings.length === 0 && <p className="text-center py-10 italic text-gray-400 text-sm">Henüz aktivite yok.</p>}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* Hızlı Eylemler */}
                    <div className="bg-white shadow-sm rounded-[2.5rem] border border-black/5 p-8 h-full">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Kısayollar
                        </h2>
                        <div className="space-y-3">
                            <Link href="/admin/portfolio" className="px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-[#D49A73] hover:text-[#D49A73] transition-all font-bold text-gray-700 text-xs flex items-center justify-between group uppercase tracking-widest">
                                Portfolyo <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/admin/hero" className="px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-[#D49A73] hover:text-[#D49A73] transition-all font-bold text-gray-700 text-xs flex items-center justify-between group uppercase tracking-widest">
                                Hero <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/admin/bookings" className="px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-500 transition-all font-bold text-gray-700 text-xs flex items-center justify-between group uppercase tracking-widest">
                                Rezervasyonlar <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/admin/settings" className="px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 transition-all font-bold text-gray-700 text-xs flex items-center justify-between group uppercase tracking-widest">
                                Ayarlar <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
