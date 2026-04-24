"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Phone, Mail, Clock, CheckCircle2, XCircle, MoreVertical, Loader2, MessageCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
            const snap = await getDocs(q)
            setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error); toast.error("Rezervasyonlar yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'bookings', id), { status: newStatus })
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b))
            toast.success(`Durum: ${newStatus === 'approved' ? 'Onaylandı' : 'İptal Edildi'}`)
        } catch (error) {
            console.error(error); toast.error("Güncelleme başarısız.")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Onaylandı</span>
            case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">İptal Edildi</span>
            default: return <span className="px-3 py-1 bg-orange-100 text-[#D49A73] rounded-full text-[10px] font-bold uppercase">Beklemede</span>
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" /></div>

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Rezervasyon Takibi</h1>
                    <p className="text-gray-500">Gelen online rezervasyon taleplerini ve ödemelerini buradan yönetin.</p>
                </div>
                <button onClick={fetchBookings} className="text-sm font-semibold text-[#D49A73] hover:underline">Listeyi Yenile</button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={booking.id} 
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            {/* Client Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#FFF9E5] text-[#D49A73] border border-[#D49A73]/20 flex items-center justify-center font-black text-lg uppercase">
                                        {booking.brideName?.charAt(0) || booking.clientName?.charAt(0) || 'M'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {booking.brideName} {booking.groomName ? `& ${booking.groomName}` : ''}
                                            {(!booking.brideName && booking.clientName) && booking.clientName}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                            <span className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3 text-[#D49A73]" /> {booking.phone || booking.clientPhone}</span>
                                            <span className="flex items-center gap-1 font-medium"><Mail className="w-3 h-3 text-[#D49A73]" /> {booking.email || booking.clientEmail}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(booking.packages || booking.selectedPackages || []).map((pkg: any, idx: number) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                            {pkg.title}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Date & Amount */}
                            <div className="flex flex-col md:items-end justify-center gap-2 border-l border-gray-50 md:pl-8">
                                <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <Calendar className="w-4 h-4 text-[#D49A73]" />
                                    {booking.date || booking.eventDate ? format(new Date(booking.date || booking.eventDate), 'd MMMM yyyy', { locale: tr }) : 'Belirtilmedi'}
                                    {booking.time && <span className="text-[#D49A73]">({booking.time})</span>}
                                </span>
                                <span className="text-xl font-serif font-black text-black">{(booking.totalAmount || 0).toLocaleString('tr-TR')} TL</span>
                                {getStatusBadge(booking.status)}
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col items-center justify-center gap-2 border-l border-gray-50 md:pl-8">
                                <button 
                                    onClick={() => updateStatus(booking.id, 'approved')}
                                    className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                    title="Onayla"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    title="İptal Et"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                                <a 
                                    href={`https://wa.me/90${booking.clientPhone?.replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    title="WhatsApp'tan Yaz"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {bookings.length === 0 && (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-32 text-center text-gray-400">
                        Henüz hiç rezervasyon talebi yok.
                    </div>
                )}
            </div>
        </div>
    )
}
