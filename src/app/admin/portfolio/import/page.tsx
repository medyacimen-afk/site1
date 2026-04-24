"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import Link from 'next/link'

export default function BulkImportPage() {
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState("")

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/admin/portfolio/list-images')
            const data = await res.json()
            if (data.success) {
                setImages(data.images)
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error("Dosya listesi alınamadı.")
        } finally {
            setLoading(false)
        }
    }

    const startImport = async () => {
        if (!images.length) return
        setImporting(true)
        setStatus("İşlem başlatılıyor...")
        
        let successCount = 0
        for (let i = 0; i < images.length; i++) {
            const img = images[i]
            try {
                setStatus(`${img.name} ekleniyor...`)
                await addDoc(collection(db, 'portfolio'), {
                    title: img.title.charAt(0).toUpperCase() + img.title.slice(1),
                    category: 'Düğün Hikayesi', // Başta hepsini buraya atıyoruz
                    image: img.url,
                    isHome: false,
                    createdAt: new Date().toISOString()
                })
                successCount++
                setProgress(Math.round(((i + 1) / images.length) * 100))
            } catch (error) {
                console.error(`Hata: ${img.name}`, error)
            }
        }

        setImporting(false)
        setStatus(`Tamamlandı! ${successCount} fotoğraf başarıyla eklendi.`)
        toast.success(`${successCount} fotoğraf aktarıldı.`)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-gray-500 font-medium">Klasör taranıyor...</p>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/portfolio" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Toplu Portfolyo Aktarımı</h1>
                        <p className="text-gray-500">`public/fotoğraflar` klasöründeki dosyaları Firestore'a taşır.</p>
                    </div>
                </div>
                {!importing && images.length > 0 && progress === 0 && (
                    <button 
                        onClick={startImport}
                        className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200"
                    >
                        <Play className="w-5 h-5" />
                        Aktarımı Başlat
                    </button>
                )}
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-800">Durum Özeti</h3>
                        <p className="text-sm text-gray-500">{images.length} fotoğraf bulundu.</p>
                    </div>
                    {progress === 100 && (
                        <div className="flex items-center gap-2 text-green-600 font-bold">
                            <CheckCircle className="w-6 h-6" />
                            <span>Bitti</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                        <span>İlerleme</span>
                        <span>%{progress}</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-[#D49A73] to-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-center text-sm italic text-gray-400 font-medium animate-pulse">
                        {status}
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex gap-4">
                <AlertCircle className="w-6 h-6 text-[#D49A73] shrink-0" />
                <div className="text-sm text-orange-800 space-y-2">
                    <p className="font-bold underline decoration-2 underline-offset-4">Aktarım Öncesi Bilgilendirme:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                        <li>Tüm fotoğraflar başlangıçta <b>"Düğün Hikayesi"</b> kategorisinde eklenecektir.</li>
                        <li><b>"isHome"</b> (Anasayfa) durumu varsayılan olarak kapalı olacaktır.</li>
                        <li>İşlem bittikten sonra Portfolyo sekmesinden dilediğinizi düzenleyebilirsiniz.</li>
                        <li>İşlem sırasında tarayıcıyı veya sekmeyi <b>kapatmayın</b>.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
