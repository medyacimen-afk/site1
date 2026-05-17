"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Calendar, 
    Package, 
    User as UserIcon, 
    CreditCard, 
    ChevronRight, 
    ChevronLeft, 
    Check, 
    Loader2, 
    MessageCircle, 
    Phone,
    Heart,
    Star,
    Wallet,
    Clock,
    Users,
    Plus,
    Layout,
    Camera,
    Landmark,
    X
} from 'lucide-react'
import { format, isSameDay, isBefore, startOfToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useContent } from '@/hooks/useContent'
import Header from '@/components/public/Header'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { useSearchParams } from 'next/navigation'

const steps = [
    { id: 1, name: 'Ay', icon: Calendar },
    { id: 2, name: 'Gün', icon: Calendar },
    { id: 3, name: 'Saat', icon: Clock },
    { id: 4, name: 'Paket', icon: Package },
    { id: 5, name: 'Ekstra', icon: Plus },
    { id: 6, name: 'Onay', icon: UserIcon },
]

const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
]

const timeSlots = [
    { time: "09:00", capacity: "Popüler", count: 2 },
    { time: "11:00", capacity: "Son 1", count: 1 },
    { time: "13:00", capacity: "Uygun", count: 3 },
    { time: "15:00", capacity: "Son 2", count: 2 },
    { time: "17:00", capacity: "Popüler", count: 2 },
    { time: "19:00", capacity: "Uygun", count: 4 },
]

function ReservationContent() {
    const { services, extras, loading: contentLoading } = useContent()
    const searchParams = useSearchParams()
    const status = searchParams.get('status')
    const bookingId = searchParams.get('bookingId')
    const [step, setStep] = useState(1)
    const [completedBooking, setCompletedBooking] = useState<any>(null)
    
    // States
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedPackages, setSelectedPackages] = useState<any[]>([])
    const [selectedExtras, setSelectedExtras] = useState<any[]>([])
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
    const [userInfo, setUserInfo] = useState({ brideName: '', groomName: '', phone: '', email: '', note: '' })
    const [isClient, setIsClient] = useState(false)
    const [loading, setLoading] = useState(false)
    const [bankDetails, setBankDetails] = useState<any>(null)
    const [termsAccepted, setTermsAccepted] = useState(false)

    useEffect(() => {
        setIsClient(true)
        fetchBankDetails()
        if (bookingId && status === 'success') {
            fetchCompletedBooking()
        }
    }, [bookingId, status])

    const fetchCompletedBooking = async () => {
        if (!bookingId) return
        try {
            const snap = await getDoc(doc(db, 'bookings', bookingId))
            if (snap.exists()) setCompletedBooking(snap.data())
        } catch (e) { console.error(e) }
    }

    const fetchBankDetails = async () => {
        try {
            const snap = await getDoc(doc(db, 'settings', 'payment'))
            if (snap.exists()) setBankDetails(snap.data())
        } catch (e) { console.error(e) }
    }

    const handleMonthSelect = (mIdx: number) => {
        setSelectedMonth(mIdx)
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
    }

    const subTotalPackages = selectedPackages.reduce((acc, curr) => acc + (curr.discountedPrice ? Number(curr.discountedPrice) : (Number(curr.price) || 0)), 0)
    const subTotalExtras = (selectedExtras || []).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
    
    const isSunsetTime = selectedTime && bankDetails?.sunsetHours?.split(',').map((h: string) => h.trim()).includes(selectedTime)
    const sunsetFee = isSunsetTime ? (Number(bankDetails?.sunsetFee) || 0) : 0
    
    const subTotal = subTotalPackages + subTotalExtras + sunsetFee
    const eftDiscountRate = (Number(bankDetails?.eftDiscount) || 15) / 100
    const discount = paymentMethod === 'cash' ? subTotal * eftDiscountRate : 0
    // Move handlePackageToggle below subTotal definitions if needed, or keep here
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

    const isNextDisabled = () => {
        if (step === 1) return selectedMonth === null
        if (step === 2) return !selectedDate
        if (step === 3) return !selectedTime
        if (step === 4) return selectedPackages.length === 0
        return false
    }

    const totalAmount = subTotal - discount

    const handleConfirm = async () => {
        if (!userInfo.brideName || !userInfo.phone) {
            alert('Lütfen Gelin Adı ve Telefon numarası kısımlarını doldurunuz.')
            return;
        }
        if (!termsAccepted) {
            alert('Lütfen Kullanım Koşulları ve Mesafeli Satış Sözleşmesini onaylayınız.')
            return;
        }
        setLoading(true)

        try {
            // 1. Önce Veritabanına Kaydet (Pending olarak)
            const bookingData = {
                brideName: userInfo.brideName,
                groomName: userInfo.groomName,
                phone: userInfo.phone,
                email: userInfo.email,
                date: selectedDate?.toISOString(),
                time: selectedTime,
                packages: selectedPackages.map(p => ({ id: p.id, title: p.title, price: p.discountedPrice ? p.discountedPrice : p.price })),
                extras: selectedExtras.map(e => ({ id: e.id, title: e.title, price: e.price })),
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                status: 'pending',
                createdAt: serverTimestamp()
            }

            const docRef = await addDoc(collection(db, 'bookings'), bookingData)

            if (paymentMethod === 'cash') {
                // Nakit ödemede iyzico'yu atla, direkt başarı ekranına git
                window.location.href = `/online-rezervasyon?status=success&bookingId=${docRef.id}`
                return
            }

            // 2. Iyzico Ödemesini Başlat (Kart ise)
            // Sepet kalemleri: indirimli fiyat varsa onu kullan, gün batımı ücretini ekle
            const effectiveItems = [
                ...selectedPackages.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.discountedPrice ? Number(p.discountedPrice) : Number(p.price || 0)
                })),
                ...selectedExtras.map(e => ({
                    id: e.id,
                    title: e.title,
                    price: Number(e.price || 0)
                })),
                ...(sunsetFee > 0 ? [{ id: 'sunset-fee', title: 'Gün Batımı Farkı', price: sunsetFee }] : [])
            ]
            const response = await fetch('/api/iyzico/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    bookingId: docRef.id,
                    user: userInfo,
                    items: effectiveItems
                })
            })

            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response from API:", text);
                alert("Ödeme sistemi sunucusundan geçersiz bir yanıt alındı. Vercel üzerinde Iyzico API anahtarlarının girildiğinden emin olun.");
                return;
            }

            if (!response.ok) {
                 alert('Ödeme başlatılamadı: ' + (result?.errorMessage || result?.error || 'Bilinmeyen Hata'));
                 return;
            }

            if (result.status === 'success' && result.checkoutFormContent) {
                // Iyzico'nun ödeme sayfasını tam ekran overlay olarak göster
                const overlay = document.createElement('div')
                overlay.id = 'iyzico-overlay'
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:99999;overflow:auto;'
                overlay.innerHTML = result.checkoutFormContent
                document.body.appendChild(overlay)
                
                // Tüm scriptleri sırayla çalıştır
                const scripts = overlay.querySelectorAll('script')
                for (const oldScript of Array.from(scripts)) {
                    const newScript = document.createElement('script')
                    if (oldScript.src) {
                        newScript.src = oldScript.src
                        newScript.async = false
                    } else {
                        newScript.textContent = oldScript.textContent
                    }
                    document.head.appendChild(newScript)
                }
            } else {
                const errMsg = result.errorMessage || result.errorCode || 'Bilinmeyen hata'
                console.error('Iyzico API yanıtı:', result)
                alert(`Ödeme başlatılamadı: ${errMsg}`)
            }
        } catch (error: any) {
            console.error("Booking Error:", error)
            alert('Bir hata oluştu. Hata detayı: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)))
        } finally {
            setLoading(false)
        }
    }

    if (!isClient) return null

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-foreground pt-36 pb-32">
            <Header />
            
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Stepper Grid - Fixed Height */}
                <div className="flex flex-col items-center mb-16 text-center">
                    <div className="flex items-center gap-1 md:gap-4 w-full justify-center max-w-4xl mx-auto overflow-x-auto pb-6 no-scrollbar">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center gap-3 relative shrink-0">
                                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-primary text-white shadow-lg' : 'bg-white text-foreground/20 border border-black/5'}`}>
                                        {step > s.id ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <s.icon className="w-4 h-4 md:w-6 md:h-6" />}
                                    </div>
                                    <span className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold transition-colors ${step >= s.id ? 'text-primary' : 'text-foreground/10'}`}>{s.name}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`h-[1px] w-4 md:w-8 lg:w-12 transition-colors duration-500 ${step > s.id ? 'bg-primary' : 'bg-black/5'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Main Content - Stable Height Container */}
                    <div className="lg:col-span-8 bg-white border border-black/5 rounded-[2.5rem] p-6 md:p-12 shadow-sm min-h-[650px] flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1"
                            >
                                    {step === 1 && (
                                        <div className="space-y-10">
                                            <div className="text-left">
                                                <h2 className="text-4xl font-serif font-extrabold text-black mb-2">Lütfen çekim yaptırmak istediğiniz ayı seçin</h2>
                                                <p className="italic text-gray-600 text-sm">Planladığınız çekim ayı için uygunluk durumunu kontrol edin.</p>
                                            </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                            {months.map((month, idx) => (
                                                <button 
                                                    key={month} 
                                                    onClick={() => handleMonthSelect(idx)}
                                                    className={`group p-8 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-2 ${selectedMonth === idx ? 'border-[#D49A73] bg-[#FFF9E5] shadow-lg shadow-orange-100/50' : 'border-black/5 bg-white hover:border-[#D49A73]/30'}`}
                                                >
                                                    <span className={`text-lg font-semibold tracking-tight transition-colors ${selectedMonth === idx ? 'text-[#D49A73]' : 'text-gray-800'}`}>{month}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${selectedMonth === idx ? 'bg-[#D49A73] scale-150' : 'bg-transparent group-hover:bg-gray-200'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                    <h2 className="text-3xl font-serif font-black text-black mb-2">{months[selectedMonth || 0]} 2026</h2>
                                                    <p className="italic text-gray-600 text-sm">Müsait olduğunuz günü belirleyin.</p>
                                            </div>
                                            <button onClick={() => setStep(1)} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                                                <ChevronLeft className="w-4 h-4" /> Ayı Değiştir
                                            </button>
                                        </div>
                                        <div className="max-w-md mx-auto min-h-[380px]">
                                            <div className="grid grid-cols-7 gap-3 md:gap-4">
                                                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                                                    <div key={d} className="text-center text-[10px] uppercase font-black text-gray-300 py-2 tracking-widest">{d}</div>
                                                ))}
                                                {/* Ayın ilk günü hangi haftanın kaçıncı günü ise o kadar boş hücre ekle (Pzt=0 … Paz=6) */}
                                                {Array.from({ length: (() => { const d = new Date(2026, selectedMonth || 0, 1).getDay(); return d === 0 ? 6 : d - 1 })() }).map((_, i) => (
                                                    <div key={`empty-${i}`} />
                                                ))}
                                                {Array.from({ length: 31 }).map((_, i) => {
                                                    const day = new Date(2026, selectedMonth || 0, i + 1);
                                                    if (day.getMonth() !== (selectedMonth || 0)) return null;
                                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                                    const isPast = isBefore(day, startOfToday());
                                                    return (
                                                        <button
                                                            key={i}
                                                            disabled={isPast}
                                                            onClick={() => setSelectedDate(day)}
                                                            className={`h-11 md:h-12 w-full rounded-2xl flex items-center justify-center text-sm transition-all duration-300 ${isSelected ? 'bg-[#D49A73] text-white shadow-xl shadow-orange-200 font-bold scale-110' : isPast ? 'text-gray-100 cursor-not-allowed' : 'text-gray-800 hover:bg-gray-50 bg-white border border-black/5 hover:border-[#D49A73]/20'}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                    {step === 3 && (
                                        <div className="space-y-10">
                                            <div className="text-left">
                                                <h2 className="text-4xl font-serif font-extrabold text-black mb-2">Çekim Saati Seçimi</h2>
                                                <p className="italic text-gray-600 text-sm">{format(selectedDate || new Date(), 'd MMMM yyyy', { locale: tr })} günü için uygun saat dilimleri.</p>
                                            </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                            {timeSlots.map((slot) => {
                                                const isSunset = bankDetails?.sunsetHours?.split(',').map((h: string) => h.trim()).includes(slot.time)
                                                const isSelected = selectedTime === slot.time
                                                
                                                // Dynamic colors for capacity
                                                const statusColor = slot.capacity === 'Popüler' ? 'text-orange-500 bg-orange-50 border-orange-100' : 
                                                                   slot.capacity === 'Uygun' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                                                                   'text-red-500 bg-red-50 border-red-100'

                                                return (
                                                    <button 
                                                        key={slot.time} 
                                                        onClick={() => setSelectedTime(slot.time)}
                                                        className={`p-6 rounded-[2.5rem] border transition-all text-left relative overflow-hidden group ${isSelected ? 'border-[#D49A73] bg-[#FFF9E5] shadow-xl' : 'border-black/5 bg-white hover:border-[#D49A73]/20'}`}
                                                    >
                                                        <div className="flex flex-col gap-3 relative z-10">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-2xl font-bold tracking-tight ${isSelected ? 'text-[#D49A73]' : 'text-gray-900'}`}>{slot.time}</span>
                                                                {isSunset && <Star className={`w-5 h-5 ${isSelected ? 'text-[#D49A73] fill-[#D49A73]' : 'text-orange-300'}`} />}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className={`self-start px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isSelected ? 'bg-[#D49A73] text-white border-transparent' : statusColor}`}>
                                                                    {slot.capacity}
                                                                </div>
                                                                {isSunset && (
                                                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-[#D49A73]/60' : 'text-orange-600'}`}>
                                                                        + {Number(bankDetails?.sunsetFee).toLocaleString('tr-TR')} TL
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isSelected && <div className="absolute top-0 right-0 p-3 bg-[#D49A73] text-white rounded-bl-2xl shadow-lg"><Check className="w-3 h-3" /></div>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-10">
                                        <div className="text-left">
                                            <h2 className="text-4xl font-serif font-black text-black mb-2">Ana Paket Seçimi</h2>
                                            <p className="italic text-gray-600 text-sm">Size en uygun ana çekim paketini belirleyin.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            {services.map((pkg: any) => (
                                                <div 
                                                    key={pkg.id} 
                                                    onClick={() => handlePackageToggle(pkg)} 
                                                    className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 relative overflow-hidden flex flex-col h-full ${selectedPackages.find(p => p.id === pkg.id) ? 'bg-[#FFF9E5] border-[#D49A73] text-[#D49A73] shadow-xl scale-[0.98]' : 'bg-white border-black/5 hover:border-black/10'}`}
                                                >
                                                    <div className="h-48 rounded-[2rem] overflow-hidden mb-6 relative group/img">
                                                        <img src={pkg.image} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                                        <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-all" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold mb-1 text-black">{pkg.title}</h3>
                                                        <p className={`text-[11px] line-clamp-2 leading-relaxed italic ${selectedPackages.find(p => p.id === pkg.id) ? 'text-[#D49A73]/80' : 'text-gray-500'}`}>
                                                            {pkg.description}
                                                        </p>
                                                    </div>
                                                    <div className="mt-6 flex justify-between items-center">
                                                        <div className="flex flex-col items-start">
                                                            {pkg.discountedPrice ? (
                                                                <>
                                                                    <span className="text-[10px] font-bold text-gray-400 line-through">{(Number(pkg.price)).toLocaleString('tr-TR')} TL</span>
                                                                    <span className="text-sm font-black text-red-500">{(Number(pkg.discountedPrice)).toLocaleString('tr-TR')} TL</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-sm font-black text-black">{(Number(pkg.price) || 8500).toLocaleString('tr-TR')} TL</span>
                                                            )}
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedPackages.find(p => p.id === pkg.id) ? 'bg-[#D49A73] text-white' : 'bg-black/5 text-transparent'}`}>
                                                            <Check className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div className="space-y-10">
                                        <div className="text-left">
                                            <h2 className="text-4xl font-serif font-black text-black mb-2">Ekstra Ürün & Hizmetler</h2>
                                            <p className="italic text-gray-600 text-sm mb-10">Paketinizi harika ek ürünlerle zenginleştirin.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {extras.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => handleExtraToggle(item)} 
                                                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedExtras.find(ex => ex.id === item.id) ? 'bg-[#FFF9E5] border-[#D49A73] text-[#D49A73] shadow-lg scale-[0.98]' : 'bg-white border-black/5 hover:border-black/10'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedExtras.find(ex => ex.id === item.id) ? 'bg-[#D49A73] text-white' : 'bg-white shadow-sm'}`}>
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold block text-black">{item.title}</span>
                                                            <span className={`text-[10px] italic ${selectedExtras.find(ex => ex.id === item.id) ? 'text-[#D49A73]/80' : 'text-gray-600'}`}>+ {Number(item.price).toLocaleString('tr-TR')} TL Ek Bedel</span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedExtras.find(ex => ex.id === item.id) ? 'bg-[#D49A73] text-white' : 'bg-black/5 text-transparent'}`}>
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            ))}
                                            {extras.length === 0 && <p className="col-span-2 text-center text-xs text-black py-20 italic">Henüz ek hizmet tanımlanmamış...</p>}
                                        </div>
                                    </div>
                                )}

                                {step === 6 && (
                                    <div className="space-y-10">
                                        <div className="text-left">
                                            <h2 className="text-4xl font-serif font-black text-black mb-2">Bilgileriniz & Ödeme</h2>
                                            <p className="italic text-gray-600 text-sm">Son adım, bilgileri doldurup onaylayın.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-black ml-2">Gelin Adı</label><input type="text" value={userInfo.brideName} onChange={(e) => setUserInfo({...userInfo, brideName: e.target.value})} className="w-full bg-slate-50 border border-black/5 rounded-xl p-5 text-sm outline-none focus:border-primary" placeholder="Gelin Ad Soyad" /></div>
                                                <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-black ml-2">Damat Adı</label><input type="text" value={userInfo.groomName} onChange={(e) => setUserInfo({...userInfo, groomName: e.target.value})} className="w-full bg-slate-50 border border-black/5 rounded-xl p-5 text-sm outline-none focus:border-primary" placeholder="Damat Ad Soyad" /></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2"><label className="text-[11px] font-black uppercase text-black ml-2 tracking-widest">Telefon</label><input type="tel" value={userInfo.phone} onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})} className="w-full bg-slate-50 border border-black/5 rounded-xl p-5 text-sm outline-none focus:border-primary font-bold" placeholder="05XX XXX XX XX" /></div>
                                                <div className="space-y-2"><label className="text-[11px] font-black uppercase text-black ml-2 tracking-widest">E-Posta</label><input type="email" value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} className="w-full bg-slate-50 border border-black/5 rounded-xl p-5 text-sm outline-none focus:border-primary font-bold" placeholder="ornek@mail.com" /></div>
                                            </div>
                                            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <button onClick={() => setPaymentMethod('card')} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'border-[#D49A73] bg-[#FFF9E5] text-[#D49A73]' : 'border-black/5 text-gray-400'}`}>
                                                    <span className="text-sm font-black">Kredi Kartı</span>
                                                    <CreditCard className="w-6 h-6" />
                                                </button>
                                                <button onClick={() => setPaymentMethod('cash')} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-black/5 text-gray-400'}`}>
                                                    <div className="text-left">
                                                        <span className="text-sm font-black block">EFT / Havale</span>
                                                        <span className="text-[11px] text-emerald-600 font-black uppercase tracking-widest">%{bankDetails?.eftDiscount || '15'} İndirim</span>
                                                    </div>
                                                    <Wallet className="w-6 h-6 text-emerald-500" />
                                                </button>
                                            </div>

                                            {paymentMethod === 'cash' && bankDetails && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
                                                    <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-widest leading-none mb-2">
                                                        <Landmark className="w-4 h-4" /> Banka Bilgileri
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase">Banka / Alıcı</p>
                                                        <p className="text-sm font-bold text-emerald-900">{bankDetails.bankName} - {bankDetails.receiverName}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase">IBAN</p>
                                                        <p className="text-sm font-black text-emerald-900 tracking-wider break-all">{bankDetails.iban}</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Terms of Use */}
                                            <div className="pt-4 flex items-start gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    id="terms" 
                                                    checked={termsAccepted}
                                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                                    className="mt-1 w-4 h-4 rounded border-gray-400 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor="terms" className="text-sm text-gray-800 leading-relaxed cursor-pointer select-none font-medium">
                                                    <span className="font-black text-black underline">Kullanım Koşulları</span> ve <span className="font-black text-black underline">Mesafeli Satış Sözleşmesi</span>'ni okudum, onaylıyorum.
                                                </label>
                                            </div>

                                            {/* Button moved here */}
                                            <button 
                                                onClick={handleConfirm} 
                                                className={`w-full py-5 rounded-2xl font-black text-sm shadow-2xl mt-8 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em]
                                                    ${termsAccepted ? 'bg-[#22C55E] text-white hover:bg-[#16a34a] hover:scale-[1.02] shadow-[#22C55E]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                {loading ? <Loader2 className="w-5 h-6 animate-spin" /> : 'ÖDEMEYİ YAP VE TAMAMLA'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-auto pt-10 flex justify-between items-center border-t border-black/5">
                            <button 
                                disabled={step === 1} 
                                onClick={() => setStep(step - 1)} 
                                className="flex items-center gap-2 text-black hover:text-primary font-bold transition-all disabled:opacity-0"
                            >
                                <ChevronLeft className="w-5 h-5" /> Geri
                            </button>
                            {step < 6 && (
                                <button 
                                    disabled={isNextDisabled()} 
                                    onClick={() => setStep(step + 1)} 
                                    className={`px-12 py-5 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl
                                        ${isNextDisabled() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-primary shadow-black/10'}`}
                                >
                                    Devam Et <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Summary - Simple & Clean */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-40">
                        <div className="bg-white border border-black/5 rounded-[2.5rem] p-8">
                            <h3 className="text-lg font-bold mb-8 text-foreground/80">Rezervasyon Özeti</h3>
                            <div className="space-y-6">
                                {selectedDate && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#FFF9E5] border border-[#D49A73]/20 rounded-xl flex items-center justify-center text-[#D49A73]">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-black text-black uppercase tracking-widest mb-0.5">Çekim Zamanı</p>
                                            <p className="text-sm font-bold text-foreground/70">
                                                {format(selectedDate, 'd MMMM yyyy', { locale: tr })} 
                                                {selectedTime && <span className="text-[#D49A73] ml-2 font-black">({selectedTime})</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3 pt-6 border-t border-black/5">
                                    <p className="text-[11px] font-black text-black uppercase tracking-widest mb-2">Ürün & Paketler</p>
                                    <div className="space-y-2">
                                        {[...selectedPackages, ...selectedExtras].map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-black/5 p-4 rounded-xl text-[12px] font-bold text-foreground/80">
                                                <span>{item.title}</span>
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        ))}
                                        {[...selectedPackages, ...selectedExtras].length === 0 && (
                                            <p className="text-xs text-foreground/20 italic p-4 bg-slate-50 rounded-xl border border-dashed">Henüz seçim yapılmadı...</p>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-8 space-y-4 border-t border-dashed border-black/5">
                                    <div className="flex justify-between text-xs text-black font-black uppercase tracking-tighter"><span>Ana Paket Toplamı</span><span>{subTotalPackages.toLocaleString('tr-TR')} TL</span></div>
                                    <div className="flex justify-between text-xs text-black font-black uppercase tracking-tighter"><span>Ekstra Ürünler</span><span>{subTotalExtras.toLocaleString('tr-TR')} TL</span></div>
                                    {sunsetFee > 0 && (
                                        <div className="flex justify-between text-[13px] text-orange-700 font-black uppercase tracking-tighter bg-orange-50 p-3 rounded-xl border border-orange-200">
                                            <span className="flex items-center gap-2"><Star className="w-3 h-3 fill-orange-700" /> Gün Batımı Farkı</span>
                                            <span>+{sunsetFee.toLocaleString('tr-TR')} TL</span>
                                        </div>
                                    )}
                                    <div className="pt-2 flex justify-between text-xs text-black font-black uppercase tracking-tighter border-t border-black/10"><span>Ara Toplam</span><span>{subTotal.toLocaleString('tr-TR')} TL</span></div>
                                    {discount > 0 && (<div className="flex justify-between text-xs text-emerald-600 font-black uppercase tracking-tighter"><span>EFT İndirimi (%{bankDetails?.eftDiscount || '15'})</span><span>-{discount.toLocaleString('tr-TR')} TL</span></div>)}
                                    <div className="pt-4">
                                        <span className="text-[11px] font-black text-black uppercase block mb-2 tracking-widest">Ödenecek Toplam Tutar</span>
                                        <span className="text-5xl font-sans font-black text-[#D49A73] tracking-tighter">{totalAmount.toLocaleString('tr-TR')} <small className="text-lg">TL</small></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#111111] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
                            <h4 className="text-lg font-bold mb-2">Destek Hattı</h4><p className="text-white/40 text-[11px] mb-8 leading-relaxed italic">Takıldığınız bir yer olursa hemen WhatsApp üzerinden bizimle iletişime geçin.</p>
                            <a href="https://wa.me/905XXXXXX" target="_blank" className="bg-[#25D366] text-white w-full inline-flex items-center justify-center py-4 rounded-xl font-bold text-sm hover:bg-[#128C7E] transition-all shadow-lg shadow-[#25D366]/20">
                                WhatsApp ile Yazın
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* Status Modals */}
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 text-center">
                        <div className="max-w-md space-y-6">
                            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-serif font-black italic text-black">Tebrikler!</h2>
                            <p className="text-gray-800 leading-relaxed italic text-sm">Rezervasyonunuz başarıyla oluşturuldu. {completedBooking?.paymentMethod === 'cash' || paymentMethod === 'cash' ? 'Lütfen ödemeyi banka bilgilerine iletmeyi unutmayın.' : 'Rezervasyonunuz ve ödemeniz başarıyla tamamlandı.'} En kısa sürede sizinle iletişime geçeceğiz.</p>
                            
                            {completedBooking && (
                                <div className="bg-slate-50 p-6 rounded-2xl text-left border border-black/5 space-y-4">
                                    <h3 className="font-bold text-gray-900 border-b pb-2 mb-2">Rezervasyon Detayları</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-[10px] font-black uppercase text-gray-400">Çekim Tarihi</span>
                                            <span className="font-bold text-gray-800">{format(new Date(completedBooking.date), 'd MMMM yyyy', { locale: tr })}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black uppercase text-gray-400">Çekim Saati</span>
                                            <span className="font-bold text-gray-800">{completedBooking.time}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-[10px] font-black uppercase text-gray-400">Ana Paket</span>
                                            <span className="font-bold text-gray-800">{completedBooking.packages?.map((p: any) => p.title).join(', ')}</span>
                                        </div>
                                        {completedBooking.extras && completedBooking.extras.length > 0 && (
                                            <div className="col-span-2">
                                                <span className="block text-[10px] font-black uppercase text-gray-400">Ekstralar</span>
                                                <span className="font-bold text-gray-800">{completedBooking.extras?.map((e: any) => e.title).join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="col-span-2 border-t pt-2 mt-2">
                                            <span className="block text-[10px] font-black uppercase text-gray-400">Toplam Tutar</span>
                                            <span className="font-black text-lg text-[#D49A73]">{Number(completedBooking.totalAmount).toLocaleString('tr-TR')} TL</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(completedBooking?.paymentMethod === 'cash' || paymentMethod === 'cash') && bankDetails && (
                                <div className="bg-emerald-50 p-6 rounded-2xl text-left border border-emerald-100 space-y-3">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-200 pb-2">Ödeme Yapılacak Hesap</p>
                                    <div className="text-sm font-bold text-emerald-900">{bankDetails.bankName} - {bankDetails.receiverName}</div>
                                    <div className="text-sm font-black text-emerald-700 tracking-wider break-all">{bankDetails.iban}</div>
                                </div>
                            )}
                            <button onClick={() => window.location.href = '/'} className="bg-black text-white px-12 py-4 rounded-xl font-bold hover:bg-primary transition-colors">Ana Sayfaya Dön</button>
                        </div>
                    </motion.div>
                )}
                {status === 'fail' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 text-center">
                        <div className="max-w-md space-y-6">
                            <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
                                <X className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-serif font-black italic text-red-600">Ödeme Başarısız</h2>
                            <p className="text-gray-800 leading-relaxed italic text-sm">Üzgünüz, ödeme işleminiz sırasında bir hata oluştu. Lütfen tekrar deneyin veya bizimle iletişime geçin.</p>
                            <button onClick={() => window.location.href = '/online-rezervasyon'} className="bg-black text-white px-12 py-4 rounded-xl font-bold hover:bg-primary transition-colors">Tekrar Dene</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[110] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Ödeme Formu Hazırlanıyor...</span>
                </div>
            )}
        </div>
    )
}

export default function OnlineReservationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
            <ReservationContent />
        </Suspense>
    )
}
