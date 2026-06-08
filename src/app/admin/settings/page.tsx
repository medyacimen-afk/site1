"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Save, Loader2, Landmark, User, CreditCard, ShieldCheck, Star, Clock, AlertCircle, Plus, CalendarDays, Sun, Building2, Phone, Mail, MapPin, Instagram, Facebook, Youtube, Globe, Sparkles, ImageIcon, Eye, EyeOff, Upload, KeyRound, CheckCircle2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { uploadImage } from '@/lib/upload'

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingSite, setSavingSite] = useState(false)
    const [savingApi, setSavingApi] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [logoUploadProgress, setLogoUploadProgress] = useState(0)
    const [showApiKey, setShowApiKey] = useState(false)
    const logoInputRef = useRef<HTMLInputElement>(null)

    // Yapay Zeka API Ayarları (settings/api)
    const [apiSettings, setApiSettings] = useState({ geminiApiKey: '' })

    // Giriş bilgileri değiştirme
    const [authForm, setAuthForm] = useState({ username: '', currentPassword: '', newPassword: '', confirmPassword: '' })
    const [savingPw, setSavingPw] = useState(false)
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })

    // Site Bilgileri (settings/site)
    const [siteInfo, setSiteInfo] = useState({
        businessName: '',
        tagline: '',
        about: '',
        logoUrl: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        city: '',
        instagram: '',
        facebook: '',
        youtube: '',
    })

    const [settings, setSettings] = useState({
        bankName: '',
        receiverName: '',
        iban: '',
        eftDiscount: '15',
        sunsetFee: '0',
        sunsetHours: '17:00, 19:00',
        // Gün batımı: bu saatten itibaren (dahil) ek ücret uygulanır
        sunsetStartTime: '17:00',
        // Hafta sonu (sezon) farkı
        weekendFee: '0',
        // Hangi aylarda hafta sonu farkı uygulanır (ay numaraları, virgülle)
        weekendMonths: '6,7,8,9'
    })

    const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00']

    const selectedMonths = (settings.weekendMonths || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

    const toggleMonth = (monthNum: number) => {
        const cur = new Set(selectedMonths)
        const key = String(monthNum)
        if (cur.has(key)) cur.delete(key)
        else cur.add(key)
        const ordered = Array.from(cur)
            .map(Number)
            .sort((a, b) => a - b)
            .join(',')
        setSettings({ ...settings, weekendMonths: ordered })
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const [paymentSnap, siteSnap, apiSnap] = await Promise.all([
                getDoc(doc(db, 'settings', 'payment')),
                getDoc(doc(db, 'settings', 'site')),
                getDoc(doc(db, 'settings', 'api')),
            ])
            if (paymentSnap.exists()) setSettings(prev => ({ ...prev, ...paymentSnap.data() }))
            if (siteSnap.exists()) setSiteInfo(prev => ({ ...prev, ...siteSnap.data() }))
            if (apiSnap.exists()) setApiSettings(prev => ({ ...prev, ...apiSnap.data() }))
        } catch (error) {
            console.error(error); toast.error("Ayarlar yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveApi = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingApi(true)
        try {
            await setDoc(doc(db, 'settings', 'api'), apiSettings, { merge: true })
            toast.success("API ayarları kaydedildi.")
        } catch (error) {
            console.error(error); toast.error("Kaydetme hatası.")
        } finally {
            setSavingApi(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (authForm.newPassword !== authForm.confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor.')
            return
        }
        if (authForm.newPassword.length < 4) {
            toast.error('Yeni şifre en az 4 karakter olmalıdır.')
            return
        }
        setSavingPw(true)
        try {
            // Mevcut şifreyi doğrula
            const verifyRes = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: authForm.username || undefined,
                    password: authForm.currentPassword,
                    verifyOnly: true,
                }),
            })

            // Mevcut şifrenin doğruluğunu kontrol et
            const authSnap = await getDoc(doc(db, 'settings', 'auth'))
            const savedPw = authSnap.exists() ? (authSnap.data().password || '123456') : '123456'
            if (authForm.currentPassword !== savedPw) {
                toast.error('Mevcut şifre hatalı.')
                return
            }

            // Yeni bilgileri kaydet
            const update: Record<string, string> = {
                password: authForm.newPassword,
            }
            if (authForm.username.trim()) {
                update.username = authForm.username.trim()
            }
            await setDoc(doc(db, 'settings', 'auth'), update, { merge: true })

            toast.success('Giriş bilgileri güncellendi. Bir sonraki girişte yeni bilgilerinizi kullanın.')
            setAuthForm({ username: '', currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err: any) {
            toast.error(err?.message || 'Güncellenemedi.')
        } finally {
            setSavingPw(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingLogo(true)
        setLogoUploadProgress(0)
        try {
            const url = await uploadImage(file, 'logo', (p) => setLogoUploadProgress(Math.round(p)))
            setSiteInfo(prev => ({ ...prev, logoUrl: url }))
            // Hemen kaydet
            await setDoc(doc(db, 'settings', 'site'), { logoUrl: url }, { merge: true })
            toast.success("Logo yüklendi ve kaydedildi!")
        } catch (err) {
            console.error(err); toast.error("Logo yüklenemedi.")
        } finally {
            setUploadingLogo(false)
            setLogoUploadProgress(0)
            if (logoInputRef.current) logoInputRef.current.value = ''
        }
    }

    const handleSaveSite = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingSite(true)
        try {
            await setDoc(doc(db, 'settings', 'site'), siteInfo, { merge: true })
            toast.success("Site bilgileri güncellendi.")
        } catch (error) {
            console.error(error); toast.error("Kaydetme hatası.")
        } finally {
            setSavingSite(false)
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
                <p className="text-gray-500 mt-2 italic text-sm">Site bilgileri, ödeme yöntemleri ve ücretlendirme kurallarınızı buradan yönetin.</p>
            </motion.div>

            {/* ─── SİTE BİLGİLERİ ─── */}
            <form onSubmit={handleSaveSite} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 shadow-sm space-y-10">
                    <div className="flex items-center gap-3 text-xl font-bold text-gray-800 border-b border-gray-100 pb-5">
                        <Globe className="w-6 h-6 text-[#D49A73]" />
                        Site Bilgileri
                        <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Site genelinde görünür</span>
                    </div>

                    {/* İşletme Adı + Slogan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">İşletme / Marka Adı</label>
                            <div className="relative">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input type="text" value={siteInfo.businessName} onChange={e => setSiteInfo({...siteInfo, businessName: e.target.value})}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold"
                                    placeholder="Örn: İstanbul Düğün Fotoğrafçısı" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Kısa Slogan</label>
                            <input type="text" value={siteInfo.tagline} onChange={e => setSiteInfo({...siteInfo, tagline: e.target.value})}
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 outline-none focus:border-[#D49A73] transition-all"
                                placeholder="Örn: Anılarınızı Ölümsüzleştiriyoruz" />
                        </div>
                    </div>

                    {/* Footer Kısa Açıklama */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Kısa Açıklama (Footer'da görünür)</label>
                        <textarea value={siteInfo.about} onChange={e => setSiteInfo({...siteInfo, about: e.target.value})}
                            rows={2}
                            className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 outline-none focus:border-[#D49A73] transition-all resize-none"
                            placeholder="Örn: 10 yılı aşkın tecrübemizle en özel anlarınızı ölümsüzleştiriyoruz." />
                    </div>

                    {/* Logo Yükleme */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Logo
                        </label>
                        <div className="flex items-center gap-4">
                            {/* Önizleme */}
                            {siteInfo.logoUrl && (
                                <div className="w-20 h-14 rounded-xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={siteInfo.logoUrl} alt="Logo" className="max-h-12 max-w-full object-contain p-1" />
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                {/* Upload butonu */}
                                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload}
                                    className="hidden" id="logo-upload-input" />
                                <label htmlFor="logo-upload-input"
                                    className="flex items-center gap-2 cursor-pointer w-fit bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-600 hover:border-[#D49A73] hover:text-[#D49A73] transition-all">
                                    {uploadingLogo
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor... %{logoUploadProgress}</>
                                        : <><Upload className="w-4 h-4" /> Logo Yükle</>}
                                </label>
                                {/* Manuel URL */}
                                <input type="text" value={siteInfo.logoUrl} onChange={e => setSiteInfo({...siteInfo, logoUrl: e.target.value})}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-3 outline-none focus:border-[#D49A73] transition-all font-mono text-xs"
                                    placeholder="/logo.webp  veya  https://..." />
                                <p className="text-[11px] text-gray-400 ml-1">Dosya yükleyebilir veya URL girebilirsiniz</p>
                            </div>
                        </div>
                    </div>

                    {/* İletişim */}
                    <div className="border-t border-gray-100 pt-8">
                        <p className="text-sm font-bold text-gray-600 mb-6 flex items-center gap-2"><Phone className="w-4 h-4 text-[#D49A73]" /> İletişim Bilgileri</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="tel" value={siteInfo.phone} onChange={e => setSiteInfo({...siteInfo, phone: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="05xx xxx xx xx" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">WhatsApp (ülke koduyla)</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="text" value={siteInfo.whatsapp} onChange={e => setSiteInfo({...siteInfo, whatsapp: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="905xxxxxxxxx" />
                                </div>
                                <p className="text-xs text-gray-400 ml-2">Başında + olmadan: 905xxxxxxxxx</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">E-posta</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="email" value={siteInfo.email} onChange={e => setSiteInfo({...siteInfo, email: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="info@fotografci.com" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Şehir</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="text" value={siteInfo.city} onChange={e => setSiteInfo({...siteInfo, city: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="İstanbul" />
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Adres</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="text" value={siteInfo.address} onChange={e => setSiteInfo({...siteInfo, address: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="Mahalle, Sokak, Bina No, İlçe/İl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sosyal Medya */}
                    <div className="border-t border-gray-100 pt-8">
                        <p className="text-sm font-bold text-gray-600 mb-6 flex items-center gap-2"><Instagram className="w-4 h-4 text-[#D49A73]" /> Sosyal Medya (sadece kullanıcı adı)</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Instagram</label>
                                <div className="relative">
                                    <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="text" value={siteInfo.instagram} onChange={e => setSiteInfo({...siteInfo, instagram: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="fotografciadi" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Facebook</label>
                                <div className="relative">
                                    <Facebook className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="text" value={siteInfo.facebook} onChange={e => setSiteInfo({...siteInfo, facebook: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="fotografciadi" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">YouTube</label>
                                <div className="relative">
                                    <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input type="text" value={siteInfo.youtube} onChange={e => setSiteInfo({...siteInfo, youtube: e.target.value})}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                        placeholder="@fotografciadi" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={savingSite}
                    className="w-full md:w-auto bg-[#D49A73] text-white px-12 py-6 rounded-2xl font-black shadow-xl hover:bg-[#c08860] transition-all flex items-center justify-center gap-3 active:scale-95">
                    {savingSite ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    SİTE BİLGİLERİNİ KAYDET
                </button>
            </form>

            {/* ─── ÖDEME VE ÜCRETLENDIRME ─── */}
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
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">EFT İndirim Oranı (%)</label>
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
                            <label className="text-[11px] font-bold uppercase text-[#D49A73] ml-2 tracking-widest">Ek Ücret Başlangıç Saati</label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D49A73] pointer-events-none" />
                                <select
                                    value={settings.sunsetStartTime}
                                    onChange={(e) => setSettings({...settings, sunsetStartTime: e.target.value})}
                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-bold text-gray-800 appearance-none"
                                >
                                    {TIME_SLOTS.map((t) => (
                                        <option key={t} value={t}>{t} ve sonrası</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/50 rounded-2xl border border-[#D49A73]/5 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-[#D49A73] shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            <span className="font-bold text-black">Nasıl Çalışır?</span> Müşteri çekim saatini <span className="font-bold">{settings.sunsetStartTime}</span> veya sonrası seçtiğinde (ör. 17:00, 19:00), ana paket ücretine otomatik olarak <span className="font-bold">{Number(settings.sunsetFee || 0).toLocaleString('tr-TR')} TL</span> gün batımı farkı eklenir.
                        </p>
                    </div>
                </div>

                {/* Hafta Sonu (Sezon) Farkı */}
                <div className="bg-[#FFF9E5]/50 rounded-[2.5rem] border border-[#D49A73]/10 p-8 md:p-12 shadow-sm space-y-10">
                    <div className="flex items-center gap-3 text-xl font-bold text-gray-800 border-b border-[#D49A73]/10 pb-5">
                        <CalendarDays className="w-6 h-6 text-[#D49A73]" />
                        Hafta Sonu (Sezon) Farkı
                    </div>

                    <div className="space-y-3 max-w-sm">
                        <label className="text-[11px] font-bold uppercase text-[#D49A73] ml-2 tracking-widest">Hafta Sonu Ek Ücreti (TL)</label>
                        <div className="relative">
                            <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D49A73]" />
                            <input
                                type="number"
                                value={settings.weekendFee}
                                onChange={(e) => setSettings({...settings, weekendFee: e.target.value})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all font-black text-[#D49A73]"
                                placeholder="Örn: 1500"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-[#D49A73] ml-2 tracking-widest flex items-center gap-2">
                            <Sun className="w-3.5 h-3.5" /> Hangi Aylarda Uygulansın?
                        </label>
                        <p className="text-xs text-gray-500 ml-2 mb-2">Seçilen aylarda <span className="font-semibold">Cumartesi ve Pazar</span> tarihleri için ek ücret uygulanır.</p>
                        <div className="flex flex-wrap gap-2">
                            {MONTHS.map((m, idx) => {
                                const num = idx + 1
                                const active = selectedMonths.includes(String(num))
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => toggleMonth(num)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${active ? 'bg-[#D49A73] text-white shadow-md shadow-[#D49A73]/25' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#D49A73]/40'}`}
                                    >
                                        {m}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-white/50 rounded-2xl border border-[#D49A73]/5 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-[#D49A73] shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            <span className="font-bold text-black">Nasıl Çalışır?</span> Müşteri, seçtiğiniz aylardan birinde bir <span className="font-bold">Cumartesi veya Pazar</span> günü seçerse, ana paket ücretine otomatik olarak <span className="font-bold">{Number(settings.weekendFee || 0).toLocaleString('tr-TR')} TL</span> hafta sonu farkı eklenir. Ek ücret istemiyorsanız 0 girin.
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
                        ÖDEME AYARLARINI KAYDET
                    </button>
                </div>
            </form>

            {/* ─── YAPAY ZEKA API AYARLARI ─── */}
            <form onSubmit={handleSaveApi} className="space-y-8 pb-20">
                <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-xl font-bold text-gray-800 border-b border-gray-100 pb-5">
                        <Sparkles className="w-6 h-6 text-[#D49A73]" />
                        Yapay Zeka — Blog Üretimi
                        <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Gemini API</span>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Google Gemini API Key</label>
                        <div className="relative">
                            <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                value={apiSettings.geminiApiKey}
                                onChange={e => setApiSettings({ geminiApiKey: e.target.value })}
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 pr-14 outline-none focus:border-[#D49A73] transition-all font-mono text-sm"
                                placeholder="AIzaSy..."
                            />
                            <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="ml-2 space-y-1">
                            <p className="text-xs text-gray-500">
                                API anahtarı girildiğinde Blog Yazıları sayfasından yapay zeka ile blog yazısı üretebilirsiniz.
                            </p>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener"
                                className="text-xs font-semibold underline" style={{ color: '#D49A73' }}>
                                Google AI Studio'dan ücretsiz API anahtarı al →
                            </a>
                        </div>
                    </div>

                    {/* Test butonu */}
                    {apiSettings.geminiApiKey && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <p className="text-sm text-emerald-700 font-medium">
                                API anahtarı girildi. Blog sayfasından yapay zeka ile içerik üretebilirsiniz.
                            </p>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={savingApi}
                    className="w-full md:w-auto bg-[#D49A73] text-white px-12 py-6 rounded-2xl font-black shadow-xl hover:bg-[#c08860] transition-all flex items-center justify-center gap-3 active:scale-95">
                    {savingApi ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    API AYARLARINI KAYDET
                </button>
            </form>

            {/* ─── ŞİFRE DEĞİŞTİR ─── */}
            <form onSubmit={handleChangePassword} className="space-y-8 pb-20">
                <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-xl font-bold text-gray-800 border-b border-gray-100 pb-5">
                        <KeyRound className="w-6 h-6 text-[#D49A73]" />
                        Şifre Değiştir
                    </div>

                    <div className="grid grid-cols-1 gap-6 max-w-md">

                        {/* Yeni kullanıcı adı (opsiyonel) */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Yeni Kullanıcı Adı <span className="font-normal">(değiştirmek istemiyorsanız boş bırakın)</span></label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input
                                    type="text"
                                    value={authForm.username}
                                    onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:border-[#D49A73] transition-all"
                                    placeholder="örn: fotografciadi.com"
                                />
                            </div>
                        </div>

                        {/* Mevcut şifre */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Mevcut Şifre <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPw.current ? 'text' : 'password'}
                                    required
                                    value={authForm.currentPassword}
                                    onChange={e => setAuthForm({ ...authForm, currentPassword: e.target.value })}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pr-14 outline-none focus:border-[#D49A73] transition-all"
                                    placeholder="Şu anki şifreniz"
                                />
                                <button type="button"
                                    onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    {showPw.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Yeni şifre */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Yeni Şifre <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPw.next ? 'text' : 'password'}
                                    required
                                    value={authForm.newPassword}
                                    onChange={e => setAuthForm({ ...authForm, newPassword: e.target.value })}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 pr-14 outline-none focus:border-[#D49A73] transition-all"
                                    placeholder="Yeni şifreniz"
                                />
                                <button type="button"
                                    onClick={() => setShowPw(s => ({ ...s, next: !s.next }))}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    {showPw.next ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Şifre tekrar */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 ml-2 tracking-widest">Yeni Şifre Tekrar <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPw.confirm ? 'text' : 'password'}
                                    required
                                    value={authForm.confirmPassword}
                                    onChange={e => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                                    className={`w-full bg-gray-50/50 border-2 rounded-2xl p-5 pr-14 outline-none transition-all ${
                                        authForm.confirmPassword && authForm.newPassword !== authForm.confirmPassword
                                            ? 'border-red-300 focus:border-red-400'
                                            : authForm.confirmPassword && authForm.newPassword === authForm.confirmPassword
                                            ? 'border-green-300 focus:border-green-400'
                                            : 'border-gray-100 focus:border-[#D49A73]'
                                    }`}
                                    placeholder="Yeni şifreyi tekrar yazın"
                                />
                                <button type="button"
                                    onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    {showPw.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                {authForm.confirmPassword && authForm.newPassword === authForm.confirmPassword && (
                                    <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                )}
                            </div>
                            {authForm.confirmPassword && authForm.newPassword !== authForm.confirmPassword && (
                                <p className="text-red-500 text-xs ml-2">Şifreler eşleşmiyor</p>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 max-w-md">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">
                            Varsayılan giriş bilgileri: <strong>admin</strong> / <strong>123456</strong>. Güvenlik için buradan değiştirin.
                        </p>
                    </div>
                </div>

                <button type="submit"
                    disabled={savingPw || !authForm.currentPassword || !authForm.newPassword || authForm.newPassword !== authForm.confirmPassword}
                    className="w-full md:w-auto bg-black text-white px-12 py-6 rounded-2xl font-black shadow-xl hover:bg-[#D49A73] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    {savingPw ? <Loader2 className="w-6 h-6 animate-spin" /> : <KeyRound className="w-6 h-6" />}
                    GİRİŞ BİLGİLERİNİ GÜNCELLE
                </button>
            </form>
        </div>
    )
}
