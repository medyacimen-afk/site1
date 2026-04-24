"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/upload'
import { toast } from 'sonner'

export default function AdminHeroPage() {
    const [slides, setSlides] = useState<any[]>([])
    const [title, setTitle] = useState("")
    const [subtitle, setSubtitle] = useState("")
    const [aboutTitle, setAboutTitle] = useState("")
    const [aboutDesc, setAboutDesc] = useState("")
    const [stat1V, setStat1V] = useState("")
    const [stat1L, setStat1L] = useState("")
    const [stat2V, setStat2V] = useState("")
    const [stat2L, setStat2L] = useState("")
    const [stat3V, setStat3V] = useState("")
    const [stat3L, setStat3L] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Header Texts
            const settingsDoc = await getDoc(doc(db, 'settings', 'home'))
            if (settingsDoc.exists()) {
                const data = settingsDoc.data()
                setTitle(data.heroTitle || "")
                setSubtitle(data.heroSubtitle || "")
                setAboutTitle(data.aboutTitle || "")
                setAboutDesc(data.aboutDesc || "")
                setStat1V(data.stat1Value || "")
                setStat1L(data.stat1Label || "")
                setStat2V(data.stat2Value || "")
                setStat2L(data.stat2Label || "")
                setStat3V(data.stat3Value || "")
                setStat3L(data.stat3Label || "")
            }

            // Fetch Slides
            const slidesSnap = await getDocs(collection(db, 'hero_slides'))
            const slidesList = slidesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            setSlides(slidesList)
        } catch (error) {
            console.error(error)
            toast.error("Veriler yüklenirken bir hata oluştu.")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveTexts = async () => {
        setSaving(true)
        try {
            await setDoc(doc(db, 'settings', 'home'), {
                heroTitle: title,
                heroSubtitle: subtitle,
                aboutTitle: aboutTitle,
                aboutDesc: aboutDesc,
                stat1Value: stat1V,
                stat1Label: stat1L,
                stat2Value: stat2V,
                stat2Label: stat2L,
                stat3Value: stat3V,
                stat3Label: stat3L
            }, { merge: true })
            toast.success("Yazılar başarıyla güncellendi.")
        } catch (error) {
            console.error(error)
            toast.error("Yazılar kaydedilemedi.")
        } finally {
            setSaving(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await uploadImage(file, 'hero')
            const docRef = await addDoc(collection(db, 'hero_slides'), {
                image: url,
                thumb: url, // For simplicity, using same url
                createdAt: new Date().toISOString()
            })
            setSlides([...slides, { id: docRef.id, image: url, thumb: url }])
            toast.success("Fotoğraf başarıyla eklendi.")
        } catch (error) {
            console.error(error)
            toast.error("Fotoğraf yüklenemedi.")
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteSlide = async (id: string) => {
        if (!confirm("Bu slaytı silmek istediğinize emin misiniz?")) return

        try {
            await deleteDoc(doc(db, 'hero_slides', id))
            setSlides(slides.filter(s => s.id !== id))
            toast.success("Slayt silindi.")
        } catch (error) {
            console.error(error)
            toast.error("Slayt silinemedi.")
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" />
        </div>
    )

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ana Sayfa Hero Ayarları</h1>
                    <p className="text-gray-500">Girişteki 3 satırlık yazıyı ve arka planda değişen dev slaytları düzenleyin.</p>
                </div>
                <button 
                    onClick={handleSaveTexts}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#D49A73] hover:bg-[#c2845c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Kaydet
                </button>
            </div>

            {/* Metin İçeriği Ayarları */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h2 className="font-semibold text-gray-800">Manşet Metinleri</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Büyük Başlık (HTML &lt;br/&gt; destekler)</label>
                        <textarea 
                            rows={3}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-[#D49A73] focus:border-[#D49A73] shadow-sm outline-none transition-all resize-none font-sans"
                            placeholder="En Özel Anları Yakalıyoruz,<br/>Sizin Hikayenizi Yazıyoruz"
                        />
                        <p className="text-xs text-gray-400 mt-1">İpucu: Alt satıra geçmek için metnin arasına `&lt;br/&gt;` yazabilirsiniz.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alt Açıklama (Paragraf)</label>
                        <textarea 
                            rows={3}
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-[#D49A73] focus:border-[#D49A73] shadow-sm outline-none transition-all resize-none"
                            placeholder="Kısa tanıtım metni..."
                        />
                    </div>
                </div>
            </div>

            {/* Hakkımızda Metin İçeriği Ayarları */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h2 className="font-semibold text-gray-800">Hakkımızda Bölümü Ayarları</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımızda Başlığı</label>
                        <textarea 
                            rows={2}
                            value={aboutTitle}
                            onChange={(e) => setAboutTitle(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-[#D49A73] focus:border-[#D49A73] shadow-sm outline-none transition-all resize-none font-sans"
                            placeholder="Mercekten Bakarak <br/> Aşkın Dünyasını Keşfedin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımızda Açıklaması</label>
                        <textarea 
                            rows={4}
                            value={aboutDesc}
                            onChange={(e) => setAboutDesc(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-[#D49A73] focus:border-[#D49A73] shadow-sm outline-none transition-all resize-none"
                            placeholder="Açıklama metni..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">İstatistik 1</span>
                            <input value={stat1V} onChange={(e) => setStat1V(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 text-sm" placeholder="Değer (Örn: 10+)" />
                            <input value={stat1L} onChange={(e) => setStat1L(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 text-sm" placeholder="Etiket (Örn: Tecrübe)" />
                        </div>
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">İstatistik 2</span>
                            <input value={stat2V} onChange={(e) => setStat2V(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 text-sm" placeholder="Değer (Örn: 450+)" />
                            <input value={stat2L} onChange={(e) => setStat2L(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 text-sm" placeholder="Etiket (Örn: Mutlu Çift)" />
                        </div>
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">İstatistik 3</span>
                            <input value={stat3V} onChange={(e) => setStat3V(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 text-sm" placeholder="Değer (Örn: 900+)" />
                            <input value={stat3L} onChange={(e) => setStat3L(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 text-sm" placeholder="Etiket (Örn: Çekim)" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Slayt Görselleri */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Arka Plan Slaytları</h2>
                    <label className="flex items-center gap-1 text-sm text-[#D49A73] font-medium hover:text-black transition-colors cursor-pointer">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Yeni Fotoğraf Ekle
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {slides.map((slide, index) => (
                            <div key={slide.id} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video">
                                <img src={slide.image} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                                {/* Action Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleDeleteSlide(slide.id)}
                                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg" 
                                        title="Slaytı Sil"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold uppercase">
                                    Slayt #{index + 1}
                                </div>
                            </div>
                        ))}

                        {/* Upload Loader Box */}
                        {uploading && (
                            <div className="border-2 border-dashed border-[#D49A73] bg-orange-50 rounded-xl aspect-video flex flex-col items-center justify-center text-[#D49A73]">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <span className="text-sm font-medium">Yükleniyor...</span>
                            </div>
                        )}

                        {/* Empty State / Add Box */}
                        {slides.length === 0 && !uploading && (
                            <label className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex flex-col items-center justify-center text-gray-500 hover:text-[#D49A73] hover:border-[#D49A73] hover:bg-orange-50 transition-colors cursor-pointer w-full">
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">İlk Slaytı Yükleyin</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    )
}
