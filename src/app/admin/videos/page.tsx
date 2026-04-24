"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, PlayCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminVideosPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showAdd, setShowAdd] = useState(false)

    const [newTitle, setNewTitle] = useState("")
    const [newYoutubeUrl, setNewYoutubeUrl] = useState("")

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'))
            const snap = await getDocs(q)
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error)
            toast.error("Videolar yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle || !newYoutubeUrl) return toast.error("Lütfen başlık ve YouTube linki girin.")
        
        const videoId = extractYoutubeId(newYoutubeUrl)
        if (!videoId) return toast.error("Geçerli bir YouTube linki girmediniz.")

        setUploading(true)
        try {
            const docRef = await addDoc(collection(db, 'videos'), {
                title: newTitle,
                youtubeId: videoId,
                createdAt: new Date().toISOString()
            })
            setItems([{ id: docRef.id, title: newTitle, youtubeId: videoId }, ...items])
            setShowAdd(false)
            setNewTitle("")
            setNewYoutubeUrl("")
            toast.success("Yeni video eklendi.")
        } catch (error) {
            console.error(error)
            toast.error("Video eklenemedi.")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) return
        try {
            await deleteDoc(doc(db, 'videos', id))
            setItems(items.filter(i => i.id !== id))
            toast.success("Video silindi.")
        } catch (error) {
            console.error(error)
            toast.error("Silme işlemi başarısız.")
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" />
        </div>
    )

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Düğün Klipleri Yönetimi</h1>
                    <p className="text-gray-500">YouTube üzerindeki videolarınızı sisteme ekleyin.</p>
                </div>
                <button 
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 bg-[#D49A73] hover:bg-[#c2845c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? 'Kapat' : 'Video Ekle'}
                </button>
            </div>

            {/* Add New Form */}
            {showAdd && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md border border-orange-100 p-6 md:p-8"
                >
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Video Başlığı</label>
                            <input 
                                type="text"
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-[#D49A73] focus:border-[#D49A73] outline-none"
                                placeholder="Örn: Sivas Düğün Hikayesi - Ahmet & Ayşe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">YouTube Linki</label>
                            <input 
                                type="text"
                                required
                                value={newYoutubeUrl}
                                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-[#D49A73] focus:border-[#D49A73] outline-none"
                                placeholder="Örn: https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button 
                                type="submit"
                                disabled={uploading}
                                className="bg-black text-white px-8 py-3 w-full rounded-lg font-bold hover:bg-[#D49A73] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlayCircle className="w-5 h-5" /> Videoyu Sisteme Ekle</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Ekli Videolar</h2>
                    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{items.length} Video</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Önizleme</th>
                                <th className="px-6 py-4 font-medium">Başlık</th>
                                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-16 w-28 rounded-md overflow-hidden bg-gray-100 shadow-sm relative group">
                                            <img src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{item.title}</div>
                                        <a href={`https://youtube.com/watch?v=${item.youtubeId}`} target="_blank" className="text-[10px] text-blue-500 hover:underline">YouTube'da İzle</a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
                                        Henüz video eklenmemiş.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
