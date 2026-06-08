"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    Clock,
    Check,
    ChevronRight,
    ChevronDown,
    Loader2,
    Wallet,
    Star,
    Phone,
    MessageCircle,
    Users,
    ArrowLeft,
    Camera
} from 'lucide-react'
import { format, isSameDay, isBefore, startOfToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useContent } from '@/hooks/useContent'
import Header from '@/components/public/Header'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { useSearchParams } from 'next/navigation'
import { useSiteSettings } from '@/hooks/useSiteSettings'

// ——— Tasarım dili: altın gradient + Sofia Sans + 12px köşeler ———
const GOLD = '#B09050'
const GOLD_GRAD = 'linear-gradient(135deg, #CAAE78, #B09050)'

const steps = [
    { id: 1, name: 'Tarih', icon: Calendar },
    { id: 2, name: 'Saat', icon: Clock },
    { id: 3, name: 'Paket', icon: Wallet },
    { id: 4, name: 'İletişim', icon: MessageCircle },
]

const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
]

const CAL_YEAR = 2026

const timeSlots = [
    { time: "09:00", capacity: "Popüler" },
    { time: "11:00", capacity: "Son 1" },
    { time: "13:00", capacity: "Uygun" },
    { time: "15:00", capacity: "Son 2" },
    { time: "17:00", capacity: "Popüler" },
    { time: "19:00", capacity: "Uygun" },
]

function ReservationContent() {
    const { services, extras } = useContent()
    const { siteSettings, links } = useSiteSettings()
    const searchParams = useSearchParams()
    const status = searchParams.get('status')

    const [step, setStep] = useState(1)
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedPackages, setSelectedPackages] = useState<any[]>([])
    const [selectedExtras, setSelectedExtras] = useState<any[]>([])
    const [userInfo, setUserInfo] = useState({
        brideName: '',
        groomName: '',
        bridePhone: '',
        note: ''
    })
    const [isClient, setIsClient] = useState(false)
    const [loading, setLoading] = useState(false)
    const [bankDetails, setBankDetails] = useState<any>(null)
    const [summaryOpen, setSummaryOpen] = useState(false)
    const [completedData, setCompletedData] = useState<{
        whatsappUrl: string
        name: string
        phone: string
        dateStr: string
        time: string
        packageNames: string
        total: number
    } | null>(null)

    useEffect(() => {
        setIsClient(true)
        fetchBankDetails()
    }, [])

    const fetchBankDetails = async () => {
        try {
            const snap = await getDoc(doc(db, 'settings', 'payment'))
            if (snap.exists()) setBankDetails(snap.data())
        } catch (e) { console.error(e) }
    }

    // ——— Hesaplamalar ———
    const subTotalPackages = selectedPackages.reduce((acc, curr) => acc + (curr.discountedPrice ? Number(curr.discountedPrice) : (Number(curr.price) || 0)), 0)
    const subTotalExtras = (selectedExtras || []).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)

    // Gün batımı: belirlenen başlangıç saatinden itibaren (dahil) ek ücret.
    // Eşik saat ayarı yoksa eski "saat listesi" mantığına düşer (geriye dönük uyumluluk).
    const sunsetStart = bankDetails?.sunsetStartTime || null
    const isSunsetTime = selectedTime && (
        sunsetStart
            ? selectedTime >= sunsetStart
            : bankDetails?.sunsetHours?.split(',').map((h: string) => h.trim()).includes(selectedTime)
    )
    const sunsetFee = isSunsetTime ? (Number(bankDetails?.sunsetFee) || 0) : 0

    // Hafta sonu (sezon) farkı: seçilen ayda Cumartesi/Pazar ise.
    const weekendMonthsList = (bankDetails?.weekendMonths || '')
        .split(',').map((s: string) => s.trim()).filter(Boolean)
    const isWeekendDay = selectedDate ? (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) : false
    const isInWeekendMonth = selectedDate ? weekendMonthsList.includes(String(selectedDate.getMonth() + 1)) : false
    const weekendFee = (isWeekendDay && isInWeekendMonth) ? (Number(bankDetails?.weekendFee) || 0) : 0

    const subTotal = subTotalPackages + subTotalExtras + sunsetFee + weekendFee
    const totalAmount = subTotal

    const handlePackageToggle = (pkg: any) => {
        const isSelected = selectedPackages.some(p => p.id === pkg.id)
        if (isSelected) {
            setSelectedPackages(selectedPackages.filter(p => p.id !== pkg.id))
        } else {
            setSelectedPackages([pkg])
        }
    }

    const handleExtraToggle = (item: any) => {
        if (selectedExtras.find(ex => ex.id === item.id)) {
            setSelectedExtras(selectedExtras.filter(ex => ex.id !== item.id))
        } else {
            setSelectedExtras([...selectedExtras, item])
        }
    }

    // gün seçilince otomatik Saat adımına geç
    const handleDaySelect = (day: Date) => {
        setSelectedDate(day)
        setStep(2)
    }
    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
        setStep(3)
    }

    const isPackageStepValid = selectedPackages.length > 0

    const handleConfirm = async () => {
        if (!userInfo.brideName || !userInfo.bridePhone) {
            alert('Lütfen adınızı ve telefon numaranızı doldurunuz.')
            return
        }
        setLoading(true)
        try {
            // Firebase'e lead olarak kaydet
            await addDoc(collection(db, 'bookings'), {
                brideName: userInfo.brideName,
                groomName: userInfo.groomName,
                bridePhone: userInfo.bridePhone,
                phone: userInfo.bridePhone,
                note: userInfo.note,
                date: selectedDate?.toISOString(),
                time: selectedTime,
                packages: selectedPackages.map(p => ({ id: p.id, title: p.title, price: p.discountedPrice ?? p.price })),
                extras: selectedExtras.map(e => ({ id: e.id, title: e.title, price: e.price })),
                sunsetFee,
                weekendFee,
                totalAmount,
                status: 'pending',
                source: 'whatsapp',
                createdAt: serverTimestamp()
            })

            // WhatsApp mesajı oluştur
            const dateStr = selectedDate ? format(selectedDate, 'd MMMM yyyy EEEE', { locale: tr }) : ''
            const packageNames = selectedPackages.map(p => p.title).join(', ')
            const extraNames = selectedExtras.length > 0 ? `\nEkstralar: ${selectedExtras.map(e => e.title).join(', ')}` : ''
            const priceStr = totalAmount > 0 ? `\nTahmini Tutar: ${Math.round(totalAmount).toLocaleString('tr-TR')} ₺` : ''

            const msg = `Merhaba, rezervasyon talebi iletmek istiyorum.\n\nAd Soyad: ${userInfo.brideName}${userInfo.groomName ? ' & ' + userInfo.groomName : ''}\nTelefon: ${userInfo.bridePhone}\nTarih: ${dateStr}\nSaat: ${selectedTime}\nPaket: ${packageNames}${extraNames}${priceStr}${userInfo.note ? '\nNot: ' + userInfo.note : ''}`

            const waNumber = siteSettings.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || ''
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`

            // Sonuç ekranını göster (redirect yerine)
            setCompletedData({
                whatsappUrl: waUrl,
                name: userInfo.brideName + (userInfo.groomName ? ' & ' + userInfo.groomName : ''),
                phone: userInfo.bridePhone,
                dateStr,
                time: selectedTime || '',
                packageNames,
                total: totalAmount,
            })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error: any) {
            console.error('Booking Error:', error)
            alert('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    if (!isClient) return null

    const today = startOfToday()
    const isMonthPast = (idx: number) => CAL_YEAR < today.getFullYear() || (CAL_YEAR === today.getFullYear() && idx < today.getMonth())
    const daysInMonth = new Date(CAL_YEAR, (selectedMonth ?? 0) + 1, 0).getDate()
    const firstDayOffset = (() => { const d = new Date(CAL_YEAR, selectedMonth ?? 0, 1).getDay(); return d === 0 ? 6 : d - 1 })()

    const selectionList = [
        ...selectedPackages.map(p => ({ id: p.id, title: p.title, price: p.discountedPrice ? Number(p.discountedPrice) : Number(p.price || 0) })),
        ...selectedExtras.map(e => ({ id: e.id, title: e.title, price: Number(e.price || 0) })),
        ...(sunsetFee > 0 ? [{ id: 'sunset', title: 'Gün Batımı Farkı', price: sunsetFee }] : []),
        ...(weekendFee > 0 ? [{ id: 'weekend', title: 'Hafta Sonu Farkı', price: weekendFee }] : [])
    ]

    // Takvimde hafta sonu farkı uygulanan günü işaretlemek için yardımcı
    const isWeekendSurchargeDay = (day: Date) =>
        Number(bankDetails?.weekendFee) > 0 &&
        weekendMonthsList.includes(String(day.getMonth() + 1)) &&
        (day.getDay() === 0 || day.getDay() === 6)

    // ── SONUÇ EKRANI ──────────────────────────────────────────────────────────
    if (completedData) {
        return (
            <div className="min-h-screen bg-[#FAF8F4] text-[#1A1A1A] pt-28 pb-24"
                style={{ fontFamily: "'Sofia Sans', ui-sans-serif, system-ui, sans-serif" }}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400;500;600;700&display=swap" />
                <Header />
                <div className="container mx-auto px-4 max-w-xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                        {/* Başarı rozeti */}
                        <div className="text-center py-8">
                            <div className="w-20 h-20 text-white rounded-full flex items-center justify-center mx-auto shadow-xl mb-5"
                                style={{ backgroundImage: GOLD_GRAD }}>
                                <Check className="w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-bold">Rezervasyonunuz Alındı!</h1>
                            <p className="text-gray-500 text-sm mt-2">
                                {completedData.name} — {completedData.dateStr} · {completedData.time}
                            </p>
                        </div>

                        {/* Özet kartı */}
                        <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-3 text-sm">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Rezervasyon Detayları</p>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tarih & Saat</span>
                                <span className="font-semibold">{completedData.dateStr} · {completedData.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paket</span>
                                <span className="font-semibold text-right max-w-[60%]">{completedData.packageNames}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Telefon</span>
                                <span className="font-semibold">{completedData.phone}</span>
                            </div>
                            {completedData.total > 0 && (
                                <div className="flex justify-between border-t border-black/5 pt-3 mt-1">
                                    <span className="font-semibold">Tahmini Tutar</span>
                                    <span className="text-lg font-bold" style={{ color: GOLD }}>
                                        {Math.round(completedData.total).toLocaleString('tr-TR')} ₺
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Son adım — ödeme */}
                        <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                                    style={{ backgroundImage: GOLD_GRAD }}>1</span>
                                <p className="font-bold text-[15px]">Son Bir Adım Kaldı</p>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Rezervasyonunuzu tamamlamak için aşağıdaki banka hesabına ödeme yapabilirsiniz.
                                Ödeme dekontunuzu WhatsApp üzerinden iletmeniz yeterlidir.
                            </p>

                            {/* IBAN bilgisi */}
                            {bankDetails?.iban ? (
                                <div className="rounded-xl p-4 space-y-2"
                                    style={{ background: '#FBF6EC', border: '1px solid rgba(176,144,80,0.2)' }}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
                                        Ödeme Yapılacak Hesap
                                    </p>
                                    <p className="font-bold text-[#1A1A1A]">
                                        {bankDetails.bankName}{bankDetails.receiverName ? ` — ${bankDetails.receiverName}` : ''}
                                    </p>
                                    <p className="font-bold tracking-wide break-all text-sm" style={{ color: GOLD }}>
                                        {bankDetails.iban}
                                    </p>
                                    {bankDetails.eftDiscount && Number(bankDetails.eftDiscount) > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 EFT/Havale ile ödemelerde <strong>%{bankDetails.eftDiscount} indirim</strong> uygulanır.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl p-4 bg-gray-50 border border-gray-100 text-sm text-gray-500">
                                    Ödeme bilgileri için aşağıdan fotoğrafçı ile iletişime geçin.
                                </div>
                            )}
                        </div>

                        {/* İletişim butonları */}
                        <div className="space-y-3">
                            <a href={completedData.whatsappUrl} target="_blank" rel="noopener"
                                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95 shadow-lg"
                                style={{ background: '#25D366' }}>
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp'tan Yazın &amp; Dekontu İletin
                            </a>
                            {siteSettings.phone && (
                                <a href={links.phone}
                                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 border-2"
                                    style={{ borderColor: GOLD, color: GOLD }}>
                                    <Phone className="w-5 h-5" />
                                    {siteSettings.phone}
                                </a>
                            )}
                            <button onClick={() => window.location.href = '/'}
                                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                                Ana Sayfaya Dön
                            </button>
                        </div>

                    </motion.div>
                </div>
            </div>
        )
    }
    // ── /SONUÇ EKRANI ──────────────────────────────────────────────────────────

    return (
        <div
            className="min-h-screen bg-[#FAF8F4] text-[#1A1A1A] pt-28 pb-24"
            style={{ fontFamily: "'Sofia Sans', ui-sans-serif, system-ui, sans-serif" }}
        >
            {/* Sofia Sans fontu */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400;500;600;700&display=swap" />

            <Header />

            <div className="container mx-auto px-4 max-w-3xl">

                {/* Başlık */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        <span style={{ color: GOLD }}>Online</span> Rezervasyon
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">Tarih seçin, paketinizi belirleyin, hemen randevu oluşturun.</p>
                </div>

                <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-6 md:p-10">

                        {/* Stepper */}
                        <div className="flex items-center justify-center mb-10">
                            {steps.map((s, idx) => {
                                const done = step > s.id
                                const active = step === s.id
                                return (
                                    <React.Fragment key={s.id}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                                                style={done || active
                                                    ? { backgroundImage: GOLD_GRAD, color: '#fff' }
                                                    : { background: '#EFEDE9', color: '#B6B2AC' }}
                                            >
                                                {done ? <Check className="w-5 h-5" /> : s.id}
                                            </div>
                                            <span className="text-[11px] font-semibold" style={{ color: done || active ? GOLD : '#B6B2AC' }}>{s.name}</span>
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className="flex-1 h-[2px] mx-1 md:mx-2 -mt-5 rounded-full" style={{ background: step > s.id ? GOLD : '#EAE7E2' }} />
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* ADIM 1 — TARİH (ay + gün) */}
                                {step === 1 && (
                                    <div>
                                        {selectedMonth === null ? (
                                            <>
                                                <div className="text-center mb-8">
                                                    <h2 className="text-2xl font-bold">Çekiminizi Hangi Ayda Yaptırmak İstersiniz?</h2>
                                                    <p className="text-gray-500 text-sm mt-1">Lütfen çekim yaptırmak istediğiniz ayı seçin.</p>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {months.map((month, idx) => {
                                                        const past = isMonthPast(idx)
                                                        return (
                                                            <button
                                                                key={month}
                                                                disabled={past}
                                                                onClick={() => { setSelectedMonth(idx); setSelectedDate(null) }}
                                                                className={`py-5 rounded-xl border text-center transition-all ${past ? 'border-black/5 text-gray-300 cursor-not-allowed' : 'border-black/10 hover:border-[#CAAE78] hover:bg-[#FBF6EC]'}`}
                                                            >
                                                                <span className="block text-[15px] font-semibold">{month}</span>
                                                                <span className="block text-[11px] text-gray-400 mt-0.5">{CAL_YEAR}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-center mb-6">
                                                    <h2 className="text-2xl font-bold">{CAL_YEAR} {months[selectedMonth]} Ayında Hangi Gün Çekim Yapalım?</h2>
                                                    <p className="text-gray-500 text-sm mt-1">Lütfen çekim yapmak istediğiniz tarihi seçin.</p>
                                                </div>
                                                <div className="max-w-md mx-auto">
                                                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                                                        {['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'].map(d => (
                                                            <div key={d} className="text-center text-[10px] font-semibold text-gray-300 py-2 tracking-wide">{d}</div>
                                                        ))}
                                                        {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
                                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                                            const day = new Date(CAL_YEAR, selectedMonth, i + 1)
                                                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                                                            const isPast = isBefore(day, today)
                                                            const weekend = day.getDay() === 0 || day.getDay() === 6
                                                            const surcharge = !isPast && isWeekendSurchargeDay(day)
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    disabled={isPast}
                                                                    onClick={() => handleDaySelect(day)}
                                                                    title={surcharge ? 'Hafta sonu / sezon — ek ücret uygulanır' : undefined}
                                                                    className={`relative h-11 rounded-lg flex items-center justify-center text-sm transition-all ${isSelected ? 'text-white font-bold' : isPast ? 'text-gray-200 cursor-not-allowed' : weekend ? 'hover:bg-[#FBF6EC]' : 'text-[#1A1A1A] hover:bg-[#FBF6EC]'}`}
                                                                    style={isSelected ? { backgroundImage: GOLD_GRAD } : (!isPast && weekend ? { color: GOLD } : undefined)}
                                                                >
                                                                    {i + 1}
                                                                    {surcharge && !isSelected && (
                                                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: GOLD }} />
                                                                    )}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Takvim altı fiyat farkı bilgilendirmesi */}
                                                {(Number(bankDetails?.weekendFee) > 0 || Number(bankDetails?.sunsetFee) > 0) && (
                                                    <div className="mt-6 rounded-2xl border px-5 py-4 flex items-start gap-3" style={{ borderColor: 'rgba(176,144,80,0.3)', background: '#FBF6EC' }}>
                                                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm" style={{ color: GOLD }}>
                                                            <Star className="w-4 h-4" />
                                                        </div>
                                                        <p className="text-[13px] leading-relaxed" style={{ color: '#7A6A3F' }}>
                                                            <span className="font-bold">Fiyatlandırma Notu:</span> Hafta sonu (Cumartesi–Pazar)
                                                            {Number(bankDetails?.weekendFee) > 0 ? ` çekimleri (+${Number(bankDetails.weekendFee).toLocaleString('tr-TR')} ₺)` : ' çekimleri'}
                                                            {(Number(bankDetails?.weekendFee) > 0 && Number(bankDetails?.sunsetFee) > 0) ? ' ve ' : ' '}
                                                            gün batımı ({bankDetails?.sunsetStartTime || '17:00'} ve sonrası)
                                                            {Number(bankDetails?.sunsetFee) > 0 ? ` çekimleri (+${Number(bankDetails.sunsetFee).toLocaleString('tr-TR')} ₺)` : ' çekimleri'}
                                                            {' '}için fiyat farkı uygulanmaktadır. Toplam tutar, seçtiğiniz tarih ve saate göre otomatik hesaplanır.
                                                        </p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => { setSelectedMonth(null); setSelectedDate(null) }}
                                                    className="mt-8 w-full py-3 rounded-xl bg-[#F4F2EE] hover:bg-[#EDEAE4] text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Aylara Dön
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ADIM 2 — SAAT */}
                                {step === 2 && (
                                    <div>
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold">Harika! Şimdi Çekim Saatini Belirleyelim</h2>
                                            <p className="text-gray-500 text-sm mt-1">{format(selectedDate || new Date(), 'd MMMM yyyy EEEE', { locale: tr })}</p>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {timeSlots.map((slot) => {
                                                const isSunset = sunsetStart
                                                    ? slot.time >= sunsetStart
                                                    : bankDetails?.sunsetHours?.split(',').map((h: string) => h.trim()).includes(slot.time)
                                                const isSelected = selectedTime === slot.time
                                                return (
                                                    <button
                                                        key={slot.time}
                                                        onClick={() => handleTimeSelect(slot.time)}
                                                        className={`p-4 rounded-xl border text-center transition-all ${isSelected ? 'bg-[#FBF6EC] border-[#CAAE78]' : 'border-black/10 hover:border-[#CAAE78] hover:bg-[#FBF6EC]'}`}
                                                    >
                                                        <span className="block text-lg font-bold">{slot.time}</span>
                                                        <span
                                                            className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                            style={isSunset
                                                                ? { background: '#FBF1DC', color: GOLD }
                                                                : { background: '#F4F2EE', color: '#8A857D' }}
                                                        >
                                                            {isSunset ? 'Altın Saatler' : slot.capacity}
                                                        </span>
                                                        {isSunset && sunsetFee > 0 && (
                                                            <span className="block text-[10px] font-semibold mt-1" style={{ color: GOLD }}>
                                                                +{sunsetFee.toLocaleString('tr-TR')} TL
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="mt-8 w-full py-3 rounded-xl bg-[#F4F2EE] hover:bg-[#EDEAE4] text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Tarihe Dön
                                        </button>
                                    </div>
                                )}

                                {/* ADIM 3 — PAKET (+ekstralar) */}
                                {step === 3 && (
                                    <div>
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold">Şimdi İstediğiniz Ürün ve Hizmetleri Seçin</h2>
                                            <p className="text-gray-500 text-sm mt-1">Size özel çekim paketinizi oluşturun.</p>
                                        </div>

                                        {/* Asıl Paketler */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#B09050] text-white text-[11px] font-bold shrink-0">1</span>
                                            <span className="text-sm font-bold text-[#1A1A1A] shrink-0">Çekim Paketi Seçin</span>
                                            <span className="flex-1 h-px bg-black/5" />
                                            <span className="text-[10px] text-gray-400 shrink-0">Bir paket</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            {services.map((pkg: any) => {
                                                const sel = selectedPackages.some(p => p.id === pkg.id)
                                                const price = pkg.discountedPrice ? Number(pkg.discountedPrice) : Number(pkg.price || 0)
                                                return (
                                                    <PackageCard
                                                        key={pkg.id}
                                                        selected={sel}
                                                        title={pkg.title}
                                                        desc={pkg.description}
                                                        price={price}
                                                        oldPrice={pkg.discountedPrice ? Number(pkg.price) : undefined}
                                                        image={pkg.image}
                                                        onClick={() => handlePackageToggle(pkg)}
                                                    />
                                                )
                                            })}
                                        </div>

                                        {/* Ek Ürün & Hizmetler */}
                                        {extras.length > 0 && (
                                            <>
                                                <div className="flex items-center gap-3 mt-10 mb-5">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#B09050] text-white text-[11px] font-bold shrink-0">2</span>
                                                    <span className="text-sm font-bold text-[#1A1A1A] shrink-0">Ekstra Ekleyin</span>
                                                    <span className="flex-1 h-px bg-black/5" />
                                                    <span className="text-[10px] text-gray-400 shrink-0">İsteğe bağlı{selectedExtras.length > 0 ? ` · ${selectedExtras.length} seçili` : ''}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {extras.map((item: any) => {
                                                        const sel = selectedExtras.some(ex => ex.id === item.id)
                                                        return (
                                                            <ExtraChip
                                                                key={item.id}
                                                                selected={sel}
                                                                title={item.title}
                                                                price={Number(item.price || 0)}
                                                                image={item.image}
                                                                onClick={() => handleExtraToggle(item)}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        )}

                                        {/* Paket Tutarı */}
                                        {subTotal > 0 && (
                                            <div className="mt-6 border border-black/10 rounded-xl overflow-hidden">
                                                <div className="bg-[#F4F2EE] px-5 py-3 text-sm font-semibold flex items-center gap-2">
                                                    <Wallet className="w-4 h-4" style={{ color: GOLD }} /> Tahmini Toplam
                                                </div>
                                                <div className="px-5 py-4 flex items-center justify-between">
                                                    <p className="text-sm text-gray-500">Seçilen paket tutarı</p>
                                                    <p className="text-xl font-bold" style={{ color: GOLD }}>{subTotal.toLocaleString('tr-TR')} ₺</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-8 grid grid-cols-[auto_1fr] gap-3">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="px-6 py-3.5 rounded-xl bg-[#F4F2EE] hover:bg-[#EDEAE4] text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Geri
                                            </button>
                                            <button
                                                disabled={!isPackageStepValid}
                                                onClick={() => setStep(4)}
                                                className="py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{ backgroundImage: GOLD_GRAD }}
                                            >
                                                Devam Et <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ADIM 4 — İLETİŞİM */}
                                {step === 4 && (
                                    <div>
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold">Son Adım!</h2>
                                            <p className="text-gray-500 text-sm mt-1">Bilgilerinizi girin, WhatsApp üzerinden onaylayalım.</p>
                                        </div>

                                        {/* Rezervasyon Özeti */}
                                        <button
                                            onClick={() => setSummaryOpen(!summaryOpen)}
                                            className="w-full px-5 py-3.5 rounded-xl bg-[#FBF6EC] flex items-center justify-between text-sm font-semibold mb-6"
                                        >
                                            <span>Rezervasyon Özeti</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {summaryOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden mb-6"
                                                >
                                                    <div className="p-5 rounded-xl border border-black/10 space-y-3 text-sm">
                                                        {selectedDate && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Çekim Zamanı</span>
                                                                <span className="font-semibold">{format(selectedDate, 'd MMMM yyyy', { locale: tr })}{selectedTime ? ` · ${selectedTime}` : ''}</span>
                                                            </div>
                                                        )}
                                                        <div className="border-t border-black/5 pt-3 space-y-1.5">
                                                            {selectionList.map(it => (
                                                                <div key={it.id} className="flex justify-between">
                                                                    <span className="text-gray-600">{it.title}</span>
                                                                    <span className="font-semibold">{it.price.toLocaleString('tr-TR')} ₺</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {totalAmount > 0 && (
                                                            <div className="border-t border-black/10 pt-3 flex justify-between items-center">
                                                                <span className="font-semibold">Tahmini Tutar</span>
                                                                <span className="text-xl font-bold" style={{ color: GOLD }}>{Math.round(totalAmount).toLocaleString('tr-TR')} ₺</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* İletişim Bilgileri */}
                                        <div className="text-sm font-semibold flex items-center gap-2 mb-4" style={{ color: GOLD }}>
                                            <Users className="w-4 h-4" /> İletişim Bilgileri
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Field label="Adınız Soyadınız" required value={userInfo.brideName} onChange={(v) => setUserInfo({ ...userInfo, brideName: v })} placeholder="Ad Soyad" />
                                            <Field label="Telefon Numarası" required type="tel" value={userInfo.bridePhone} onChange={(v) => setUserInfo({ ...userInfo, bridePhone: v })} placeholder="0501 234 56 78" />
                                            <Field label="Damat Adı (opsiyonel)" value={userInfo.groomName} onChange={(v) => setUserInfo({ ...userInfo, groomName: v })} placeholder="Damadın adı soyadı" />
                                        </div>

                                        {/* Not */}
                                        <div className="mt-4">
                                            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Eklemek İstediğiniz Not</label>
                                            <textarea
                                                value={userInfo.note}
                                                onChange={(e) => setUserInfo({ ...userInfo, note: e.target.value })}
                                                placeholder="Özel istek, mekan, organizasyon detayı..."
                                                rows={2}
                                                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78] transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Bilgi kutusu */}
                                        <div className="mt-5 p-4 rounded-xl flex items-start gap-3" style={{ background: '#FBF6EC', border: '1px solid rgba(176,144,80,0.2)' }}>
                                            <MessageCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
                                            <p className="text-[13px] leading-relaxed" style={{ color: '#7A6A3F' }}>
                                                Butona tıkladığınızda seçimleriniz otomatik olarak WhatsApp mesajı olarak hazırlanır. Fotoğrafçı en kısa sürede size dönecektir.
                                            </p>
                                        </div>

                                        {/* Nav */}
                                        <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
                                            <button
                                                onClick={() => setStep(3)}
                                                className="px-6 py-4 rounded-xl bg-[#F4F2EE] hover:bg-[#EDEAE4] text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Geri
                                            </button>
                                            <button
                                                onClick={handleConfirm}
                                                disabled={loading}
                                                className="py-4 rounded-xl text-white text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                                                style={{ backgroundImage: GOLD_GRAD }}
                                            >
                                                {loading
                                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                                    : <><MessageCircle className="w-5 h-5" /> WhatsApp ile Rezervasyon Yap</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                {/* WhatsApp / Ara */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <a
                        href={links.whatsapp}
                        target="_blank"
                        className="py-3.5 rounded-xl bg-white border border-black/10 hover:border-[#CAAE78] text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp Yaz
                    </a>
                    <a
                        href={links.phone}
                        className="py-3.5 rounded-xl bg-white border border-black/10 hover:border-[#CAAE78] text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <Phone className="w-4 h-4" style={{ color: GOLD }} /> Ara
                    </a>
                </div>
            </div>

        </div>
    )
}

// ——— Yardımcı bileşenler ———
// Asıl çekim paketi kartı (fotoğraflı, premium)
function PackageCard({ selected, title, desc, price, oldPrice, image, onClick }: { selected: boolean; title: string; desc?: string; price: number; oldPrice?: number; image?: string; onClick: () => void }) {
    const discountPct = oldPrice && oldPrice > price && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 flex flex-col ${selected ? 'border-[#B09050] shadow-lg shadow-[#B09050]/15' : 'border-black/10 hover:border-[#CAAE78] hover:shadow-md'}`}
        >
            {/* Görsel */}
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F4F2EE] to-[#E6DECE]"><Camera className="w-8 h-8 text-[#C9BCA0]" /></div>
                )}
                <div className={`absolute inset-0 transition-colors ${selected ? 'bg-[#B09050]/10' : 'bg-black/0 group-hover:bg-black/5'}`} />
                {discountPct > 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow" style={{ background: '#B09050' }}>%{discountPct} İNDİRİM</span>
                )}
                <span className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow transition-all ${selected ? 'bg-[#B09050] text-white scale-100' : 'bg-white/85 text-transparent scale-90 group-hover:text-[#B09050]/40'}`}>
                    <Check className="w-4 h-4" />
                </span>
            </div>
            {/* Bilgi */}
            <div className={`p-4 flex flex-col flex-1 transition-colors ${selected ? 'bg-[#FBF6EC]' : 'bg-white'}`}>
                <h3 className="text-[15px] font-bold leading-snug">{title}</h3>
                {desc && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed line-clamp-2 flex-1">{desc}</p>}
                <div className="mt-3 flex items-baseline gap-2">
                    {oldPrice && oldPrice > price && <span className="text-xs text-gray-400 line-through">{oldPrice.toLocaleString('tr-TR')} ₺</span>}
                    <span className="text-lg font-bold" style={{ color: price === 0 ? '#8A857D' : '#1A1A1A' }}>{price === 0 ? 'Fiyat için sorun' : `${price.toLocaleString('tr-TR')} ₺`}</span>
                </div>
            </div>
        </button>
    )
}

// Ekstra ürün/hizmet kartı (küçük thumbnail'li, kompakt)
function ExtraChip({ selected, title, price, image, onClick }: { selected: boolean; title: string; price: number; image?: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${selected ? 'border-[#CAAE78] bg-[#FBF6EC]' : 'border-black/10 bg-white hover:border-[#CAAE78]'}`}
        >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9BCA0]"><Camera className="w-4 h-4" /></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{title}</p>
                <p className="text-[11px] font-bold mt-0.5" style={{ color: price === 0 ? '#8A857D' : '#B09050' }}>{price === 0 ? '+0 ₺' : `+${price.toLocaleString('tr-TR')} ₺`}</p>
            </div>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${selected ? 'bg-[#B09050] border-transparent text-white' : 'border-black/20 text-transparent'}`}>
                <Check className="w-3.5 h-3.5" />
            </span>
        </button>
    )
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
    return (
        <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                {label} {required && <span style={{ color: '#B09050' }}>*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78] transition-colors"
            />
        </div>
    )
}

export default function OnlineReservationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" style={{ color: '#B09050' }} /></div>}>
            <ReservationContent />
        </Suspense>
    )
}
