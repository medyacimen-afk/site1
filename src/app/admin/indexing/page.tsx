"use client"
import React, { useState, useMemo } from 'react'
import { Send, CheckCircle2, AlertCircle, Loader2, Globe, Search, Zap, List, Info } from 'lucide-react'
import { toast } from 'sonner'
import { districts, services, plateaus, plateauQueries, slugify } from '@/lib/seo-data'

const BASE_URL = 'https://sivasdugunfotografcisi.com'
const DAILY_LIMIT = 200

// Tüm URL'leri üret
function generateAllUrls(): { name: string; url: string; group: string }[] {
    const urls: { name: string; url: string; group: string }[] = []

    // 1. Ana sayfalar
    const mainPages = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Hakkımızda', url: `${BASE_URL}/about` },
        { name: 'İletişim', url: `${BASE_URL}/contact` },
        { name: 'Portfolyo', url: `${BASE_URL}/portfolio` },
        { name: 'Blog', url: `${BASE_URL}/blog` },
        { name: 'Paketler', url: `${BASE_URL}/packages` },
        { name: 'Online Rezervasyon', url: `${BASE_URL}/online-rezervasyon` },
        { name: 'Videolar', url: `${BASE_URL}/videos` },
        { name: 'Gizlilik Politikası', url: `${BASE_URL}/gizlilik-politikasi` },
        { name: 'Kullanım Koşulları', url: `${BASE_URL}/kullanim-kosullari` },
    ]
    mainPages.forEach(p => urls.push({ ...p, group: 'Ana Sayfalar' }))

    // 2. İlçe + Hizmet kombinasyonları
    districts.forEach(district => {
        services.forEach(service => {
            urls.push({
                name: `${district.name} ${service.name}`,
                url: `${BASE_URL}/${slugify(district.name)}-${service.id}`,
                group: 'İlçe SEO Sayfaları'
            })
        })
    })

    // 3. Plato sayfaları
    plateaus.forEach(plateau => {
        urls.push({
            name: plateau.name,
            url: `${BASE_URL}/${plateau.id}`,
            group: 'Plato Sayfaları'
        })
        plateauQueries.forEach(query => {
            urls.push({
                name: `${plateau.name} - ${query.name}`,
                url: `${BASE_URL}/${plateau.id}-${query.id}`,
                group: 'Plato SEO Sayfaları'
            })
        })
    })

    return urls
}

export default function IndexingPage() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [bulkLoading, setBulkLoading] = useState(false)
    const [bulkProgress, setBulkProgress] = useState(0)
    const [bulkTotal, setBulkTotal] = useState(0)
    const [results, setResults] = useState<any[]>([])
    const [activeGroup, setActiveGroup] = useState<string>('Ana Sayfalar')
    const [errorDetail, setErrorDetail] = useState<string | null>(null)

    const allUrls = useMemo(() => generateAllUrls(), [])
    const groups = useMemo(() => {
        const g: { [key: string]: number } = {}
        allUrls.forEach(u => { g[u.group] = (g[u.group] || 0) + 1 })
        return g
    }, [allUrls])

    const handleIndex = async (targetUrl: string, silent = false) => {
        if (!targetUrl) return false;
        if (!silent) setLoading(true)
        try {
            const res = await fetch('/api/admin/indexing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl, type: 'URL_UPDATED' })
            })
            const data = await res.json()
            if (data.success) {
                if (!silent) toast.success(`✓ Kuyruğa eklendi.`)
                setResults(prev => [{ url: targetUrl, status: 'success', time: new Date().toLocaleTimeString() }, ...prev])
                return true
            } else {
                const errMsg = data.error || 'Hata'
                const hint = data.hint || null
                const fullMsg = errMsg + (hint ? `\n\nİpucu: ${hint}` : '') + (data.details ? `\n\nDetay: ${JSON.stringify(data.details)}` : '')
                // Her zaman hata detayını göster (silent olsa bile)
                setErrorDetail(fullMsg)
                if (!silent) toast.error(errMsg)
                setResults(prev => [{ url: targetUrl, status: 'error', error: errMsg, time: new Date().toLocaleTimeString() }, ...prev])
                return false
            }
        } catch (error) {
            const msg = 'Bağlantı hatası'
            setErrorDetail(msg)
            if (!silent) toast.error(msg)
            setResults(prev => [{ url: targetUrl, status: 'error', error: msg, time: new Date().toLocaleTimeString() }, ...prev])
            return false
        } finally {
            if (!silent) setLoading(false)
        }
    }

    const handleBulkIndex = async (urlList: { url: string }[], label: string) => {
        const batch = urlList.slice(0, DAILY_LIMIT)
        setBulkLoading(true)
        setBulkProgress(0)
        setBulkTotal(batch.length)
        setErrorDetail(null)
        toast.info(`${batch.length} URL indexleniyor...`)

        let success = 0, fail = 0
        for (let i = 0; i < batch.length; i++) {
            const ok = await handleIndex(batch[i].url, true)
            ok ? success++ : fail++
            setBulkProgress(i + 1)
            // Rate limit koruması
            await new Promise(r => setTimeout(r, 300))
            // İlk hata varsa detayı göster
            if (!ok && fail === 1) {
                const lastResult = results[0]
                if (lastResult?.error) setErrorDetail(lastResult.error)
            }
        }

        setBulkLoading(false)
        if (success > 0) {
            toast.success(`✅ ${label}: ${success} başarılı, ${fail} hatalı`)
        } else {
            toast.error(`❌ Tüm istekler başarısız. Hata detayına bakın.`)
        }
    }

    const mainPageUrls = allUrls.filter(u => u.group === 'Ana Sayfalar')
    const districtUrls = allUrls.filter(u => u.group === 'İlçe SEO Sayfaları')
    const plateauUrls = allUrls.filter(u => u.group !== 'Ana Sayfalar' && u.group !== 'İlçe SEO Sayfaları')

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D49A73]/10 text-[#D49A73] text-xs font-bold w-fit">
                    <Globe className="w-3 h-3" />
                    Google Search Console
                </div>
                <h1 className="text-3xl font-black text-black">Web <span className="text-[#D49A73]">Indexleme</span></h1>
                <p className="text-gray-500">Toplam <span className="font-bold text-black">{allUrls.length} sayfa</span> · Günlük limit <span className="font-bold text-black">{DAILY_LIMIT}</span></p>
            </div>

            {/* Hata Detayı */}
            {errorDetail && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-red-700 text-sm mb-1">Hata Detayı</p>
                        <p className="text-red-600 text-xs whitespace-pre-line">{errorDetail}</p>
                        {errorDetail.includes('GOOGLE_INDEXING_SERVICE_ACCOUNT') && (
                            <div className="mt-3 p-3 bg-red-100 rounded-xl text-xs text-red-800 font-medium">
                                <p className="font-black mb-1">✅ Çözüm:</p>
                                <p>Vercel Dashboard → Projeniz → Settings → Environment Variables</p>
                                <p className="mt-1">Key: <code className="bg-red-200 px-1 rounded">GOOGLE_INDEXING_SERVICE_ACCOUNT</code></p>
                                <p>Value: .env.local dosyanızdaki JSON değerini yapıştırın</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toplu Indexleme Butonları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ana Sayfalar */}
                <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-black text-sm">Ana Sayfalar</p>
                            <p className="text-xs text-gray-400">{mainPageUrls.length} URL</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleBulkIndex(mainPageUrls, 'Ana Sayfalar')}
                        disabled={bulkLoading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                        <Zap className="w-3 h-3" /> Indexle
                    </button>
                </div>

                {/* İlçe SEO Sayfaları */}
                <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#D49A73]/10 rounded-lg flex items-center justify-center">
                            <Search className="w-4 h-4 text-[#D49A73]" />
                        </div>
                        <div>
                            <p className="font-black text-sm">İlçe SEO Sayfaları</p>
                            <p className="text-xs text-gray-400">{districtUrls.length} URL · günde 200</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleBulkIndex(districtUrls, 'İlçe SEO')}
                        disabled={bulkLoading}
                        className="w-full bg-[#D49A73] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#c48a63] disabled:opacity-50 transition-all"
                    >
                        <Zap className="w-3 h-3" /> İlk 200'ü İndexle
                    </button>
                </div>

                {/* Plato Sayfaları */}
                <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <List className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-black text-sm">Plato Sayfaları</p>
                            <p className="text-xs text-gray-400">{plateauUrls.length} URL · günde 200</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleBulkIndex(plateauUrls, 'Plato Sayfaları')}
                        disabled={bulkLoading}
                        className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition-all"
                    >
                        <Zap className="w-3 h-3" /> İlk 200'ü İndexle
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            {bulkLoading && (
                <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-black flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#D49A73]" />
                            İndexleniyor...
                        </span>
                        <span className="font-black text-[#D49A73]">{bulkProgress} / {bulkTotal}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                            className="bg-[#D49A73] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(bulkProgress / bulkTotal) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Manuel Giriş */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                <label className="block text-sm font-bold text-gray-700">Manuel URL Girişi</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleIndex(url)}
                            placeholder="https://sivasdugunfotografcisi.com/sayfa-adi"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D49A73]/20 focus:border-[#D49A73] transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => handleIndex(url)} disabled={loading || !url}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Indexle
                    </button>
                </div>
            </div>

            {/* Bilgi Notu */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-bold">Günlük 200 istek limiti nasıl kullanılır?</p>
                    <p>Bugün İlçe SEO → yarın Plato → öbür gün kalan İlçe sayfaları. Her gün 200 URL indexleyerek tüm {allUrls.length} URL'yi birkaç günde tamamlayabilirsiniz.</p>
                </div>
            </div>

            {/* Sonuçlar */}
            {results.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="p-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-sm">
                            Son İşlemler 
                            <span className="ml-2 text-green-600">{results.filter(r => r.status === 'success').length} ✓</span>
                            <span className="ml-1 text-red-500">{results.filter(r => r.status === 'error').length} ✗</span>
                        </h3>
                        <button onClick={() => setResults([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Temizle</button>
                    </div>
                    <div className="divide-y divide-black/5 max-h-[350px] overflow-y-auto">
                        {results.map((res, index) => (
                            <div key={index} className="px-4 py-3 flex items-center justify-between text-xs">
                                <span className="font-medium text-black truncate max-w-xs mr-4">{res.url}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-gray-300">{res.time}</span>
                                    {res.status === 'success' 
                                        ? <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OK</span>
                                        : <span className="text-red-500 font-bold flex items-center gap-1" title={res.error}><AlertCircle className="w-3 h-3" /> Hata</span>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
