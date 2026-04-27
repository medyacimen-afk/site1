"use client"
import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Loader2, Globe, Search, Zap } from 'lucide-react'
import { toast } from 'sonner'

const allPages = [
    { name: 'Ana Sayfa', url: 'https://sivasdugunfotografcisi.com/' },
    { name: 'Hakkımızda', url: 'https://sivasdugunfotografcisi.com/about' },
    { name: 'İletişim', url: 'https://sivasdugunfotografcisi.com/contact' },
    { name: 'Portfolyo', url: 'https://sivasdugunfotografcisi.com/portfolio' },
    { name: 'Blog', url: 'https://sivasdugunfotografcisi.com/blog' },
    { name: 'Paketler', url: 'https://sivasdugunfotografcisi.com/packages' },
    { name: 'Online Rezervasyon', url: 'https://sivasdugunfotografcisi.com/online-rezervasyon' },
    { name: 'Videolar', url: 'https://sivasdugunfotografcisi.com/videos' },
    { name: 'Gizlilik Politikası', url: 'https://sivasdugunfotografcisi.com/gizlilik-politikasi' },
    { name: 'Kullanım Koşulları', url: 'https://sivasdugunfotografcisi.com/kullanim-kosullari' },
]

export default function IndexingPage() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [bulkLoading, setBulkLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleIndex = async (targetUrl: string) => {
        if (!targetUrl) return;
        setLoading(true)
        try {
            const res = await fetch('/api/admin/indexing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl, type: 'URL_UPDATED' })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`✓ ${targetUrl} kuyruğa eklendi.`)
                setResults(prev => [{ url: targetUrl, status: 'success', time: new Date().toLocaleTimeString(), data: data.data }, ...prev])
            } else {
                toast.error(data.error || 'Bir hata oluştu')
                setResults(prev => [{ url: targetUrl, status: 'error', error: data.error, time: new Date().toLocaleTimeString() }, ...prev])
            }
        } catch (error) {
            toast.error('Bağlantı hatası')
            setResults(prev => [{ url: targetUrl, status: 'error', error: 'Bağlantı hatası', time: new Date().toLocaleTimeString() }, ...prev])
        } finally {
            setLoading(false)
        }
    }

    const handleBulkIndex = async () => {
        setBulkLoading(true)
        toast.info(`${allPages.length} sayfa indexleniyor...`)
        let success = 0
        let fail = 0
        for (const page of allPages) {
            try {
                const res = await fetch('/api/admin/indexing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: page.url, type: 'URL_UPDATED' })
                })
                const data = await res.json()
                if (data.success) {
                    success++
                    setResults(prev => [{ url: page.url, status: 'success', time: new Date().toLocaleTimeString() }, ...prev])
                } else {
                    fail++
                    setResults(prev => [{ url: page.url, status: 'error', error: data.error, time: new Date().toLocaleTimeString() }, ...prev])
                }
            } catch {
                fail++
                setResults(prev => [{ url: page.url, status: 'error', error: 'Bağlantı hatası', time: new Date().toLocaleTimeString() }, ...prev])
            }
            // Rate limit - her istek arası 300ms bekle
            await new Promise(r => setTimeout(r, 300))
        }
        setBulkLoading(false)
        toast.success(`Toplu indexleme tamamlandı: ${success} başarılı, ${fail} hatalı`)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D49A73]/10 text-[#D49A73] text-xs font-bold w-fit">
                    <Globe className="w-3 h-3" />
                    Google Search Console
                </div>
                <h1 className="text-3xl font-black text-black">Web <span className="text-[#D49A73]">Indexleme</span></h1>
                <p className="text-gray-500">Sayfalarınızın Google arama sonuçlarında hızlıca görünmesini sağlayın.</p>
            </div>

            {/* TEK TIK TOPLU INDEXLEME */}
            <div className="bg-gradient-to-br from-black to-gray-800 p-8 rounded-2xl shadow-xl text-white space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D49A73] rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-lg">Tek Tık ile Tüm Sayfaları İndexle</h2>
                        <p className="text-white/50 text-xs">{allPages.length} sayfa Google'a bildirilecek</p>
                    </div>
                </div>
                <button
                    onClick={handleBulkIndex}
                    disabled={bulkLoading}
                    className="w-full bg-[#D49A73] hover:bg-[#c48a63] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D49A73]/20"
                >
                    {bulkLoading 
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> İndexleniyor...</>
                        : <><Zap className="w-5 h-5" /> TÜM SAYFALARI İNDEXLE</>
                    }
                </button>
            </div>

            {/* Manual Entry */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                <label className="block text-sm font-bold text-gray-700">Manuel URL Girişi</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleIndex(url)}
                            placeholder="https://sivasdugunfotografcisi.com/sayfa-adi"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D49A73]/20 focus:border-[#D49A73] transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => handleIndex(url)}
                        disabled={loading || !url}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Indexle
                    </button>
                </div>
            </div>

            {/* Quick Links & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                        <Search className="w-4 h-4 text-[#D49A73]" />
                        Tek Tek Hızlı Indexleme
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {allPages.map((page) => (
                            <button
                                key={page.url}
                                onClick={() => handleIndex(page.url)}
                                disabled={loading || bulkLoading}
                                className="text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50"
                            >
                                {page.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-[#D49A73]" />
                        Önemli Bilgi
                    </h3>
                    <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
                        <p><span className="font-bold text-black">Indexing API</span>, sayfalarınızın Google tarafından daha hızlı fark edilmesini sağlar.</p>
                        <p>Genellikle dakikalar içinde botlar sayfanızı ziyaret eder. Günde <span className="font-bold text-black">200 adet</span> istek sınırı bulunmaktadır.</p>
                        <p className="italic">* Sadece bu sitenin yetki sahibi olduğu URL'ler için çalışır.</p>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            {results.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="p-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Son İşlemler</h3>
                        <button onClick={() => setResults([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Temizle</button>
                    </div>
                    <div className="divide-y divide-black/5 max-h-[400px] overflow-y-auto">
                        {results.map((res, index) => (
                            <div key={index} className="p-4 flex items-center justify-between text-sm">
                                <div className="flex flex-col min-w-0 mr-4">
                                    <span className="font-medium text-black truncate max-w-xs md:max-w-md">{res.url}</span>
                                    <span className="text-[10px] text-gray-400">{res.time}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {res.status === 'success' ? (
                                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                            <CheckCircle2 className="w-3 h-3" /> Başarılı
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs" title={res.error}>
                                            <AlertCircle className="w-3 h-3" /> Hata
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
