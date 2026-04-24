"use client"
import React, { useState, useEffect } from 'react'
import { Save, Loader2, Landmark, User, CreditCard, ShieldCheck, Star, Clock, AlertCircle, Plus } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        bankName: '',
        receiverName: '',
        iban: '',
        eftDiscount: '15',
        sunsetFee: '0',
        sunsetHours: '17:00, 19:00'
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'payment')
            const snap = await getDoc(docRef)
            if (snap.exists()) {
                setSettings({
                    ...settings,
                    ...snap.data()
                })
            }
        } catch (error) {
            console.error(error); toast.error("Ayarlar yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await setDoc(doc(db, 'settings', 'payment'), settings)
            toast.success("Ayarlar başarıyla güncellendi.")
        } catch (error) {
            console.error(error); toast.error("Kaydetme hatası.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" /></div>

    return (
        <div className="max-w-4xl space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-serif font-black tracking-tight text-gray-900 flex items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-[#D49A73]" />
                    Sistem Ayarları
                </h1>
                <p className="text-gray-500 mt-2 italic text-sm">Ödeme yöntemleri ve özel ücretlendirme kurallarınızı buradan yönetin.</p>
            </motion.div>

            <form onSubmit={handleSave} className="space-y-8 pb-20">
                {/* Banka Bilgileri */}
                <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 shadow-sm space-y-10">
                    <div className="flex items-center gap-3 text-xl font-bold text-gray-800 border-b border-gray-100 pb-5">
                        <Landmark className="w-6 h-6 text-[#D49A73]" />
                        Banka / EFT Bilgileri
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Banka Adı</label>
                            <div className="relative">
                                <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input 
                                    type="text" 
                                    required 
                                    value={settings.bankName} 
                                    onChange={(e) => setSettings({...settings, bankName: e.target.value})} 
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold" 
                                    placeholder="Örn: Garanti Bankası" 
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Banka Adı</label>
                            <div className="relative">
                                <Star className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input 
                                    type="number" 
                                    required 
                                    value={settings.eftDiscount} 
                                    onChange={(e) => setSettings({...settings, eftDiscount: e.target.value})} 
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold" 
                                    placeholder="Örn: 15" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Alıcı Ad Soyad</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input 
                                type="text" 
                                required 
                                value={settings.receiverName} 
                                onChange={(e) => setSettings({...settings, receiverName: e.target.value})} 
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold" 
                                placeholder="Ad Soyad veya Ticari Ünvan" 
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">IBAN Numarası</label>
                        <div className="relative">
                            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input 
                                type="text" 
                                required 
                                value={settings.iban} 
                                onChange={(e) => setSettings({...settings, iban: e.target.value})} 
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold tracking-wider" 
                                placeholder="TR00 0000 0000 0000 0000 0000 00" 
                            />
                        </div>
                    </div>
                </div>

                {/* Gün Batımı Farkı */}
                <div className="bg-[#FFF9E5]/50 rounded-[2.5rem] border border-[#D49A73]/10 p-8 md:p-12 shadow-sm space-y-10">
                    <div className="flex items-center gap-3 text-xl font-bold text-gray-800 border-b border-[#D49A73]/10 pb-5">
                        <Clock className="w-6 h-6 text-[#D49A73]" />
                        Gün Batımı (Golden Hour) Ücretlendirmesi
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-[#D49A73] ml-2 tracking-widest">Gün Batımı Ek Ücreti (TL)</label>
                            <div className="relative">
                                <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D49A73]" />
                                <input 
                                    type="number" 
                                    required 
                                    value={settings.sunsetFee} 
                                    onChange={(e) => setSettings({...settings, sunsetFee: e.target.value})} 
                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-black text-[#D49A73]" 
                                    placeholder="Örn: 2000" 
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-[#D49A73] ml-2 tracking-widest">Geçerli Saatler (Virgülle Ayırın)</label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D49A73]" />
                                <input 
                                    type="text" 
                                    required 
                                    value={settings.sunsetHours} 
                                    onChange={(e) => setSettings({...settings, sunsetHours: e.target.value})} 
                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold text-gray-800" 
                                    placeholder="Örn: 17:00, 19:00" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/50 rounded-2xl border border-[#D49A73]/5 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-[#D49A73] shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            <span className="font-bold text-black">Nasıl Çalışır?</span> Belirlediğiniz saatlerden herhangi biri kullanıcı tarafından seçildiğinde, ana paket ücretine otomatik olarak buradaki ek ücret eklenir. Yaz ayları için 17:00 ve 18:00 saatlerini önermekteyiz.
                        </p>
                    </div>
                </div>

                <div className="pt-6">
                    <button 
                        type="submit" 
                        disabled={saving} 
                        className="w-full md:w-auto bg-black text-white px-12 py-6 rounded-2xl font-black shadow-2xl hover:bg-[#D49A73] transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                        TÜM AYARLARI GÜNCELLE VE SİSTEME YANSIT
                    </button>
                </div>
            </form>
        </div>
    )
}
