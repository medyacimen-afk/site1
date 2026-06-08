"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Loader2, X, UploadCloud, CheckCircle } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/upload'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminServicesPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showAdd, setShowAdd] = useState(false)

    const [newTitle, setNewTitle] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [newPrice, setNewPrice] = useState("")
    const [newDiscountedPrice, setNewDiscountedPrice] = useState("")
    const [newIsExtra, setNewIsExtra] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Düzenleme durumları
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editDesc, setEditDesc] = useState("")
    const [editPrice, setEditPrice] = useState("")
    const [editDiscountedPrice, setEditDiscountedPrice] = useState("")
    const [editIsExtra, setEditIsExtra] = useState(false)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        setLoading(true)
        try {
            const snap = await getDocs(collection(db, 'services'))
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error)
            toast.error("Hizmetler yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile || !newTitle) return toast.error("Lütfen resim ve başlık girin.")

        setUploading(true)
        try {
            if (!auth.currentUser) {
                throw new Error("Oturumunuz bulunamadı. Lütfen sayfayı yenileyip tekrar giriş yapın (Missing or insufficient permissions).");
            }
            
            const url = await uploadImage(selectedFile, 'services')
            const docRef = await addDoc(collection(db, 'services'), {
                title: newTitle,
                description: newDesc,
                price: Number(newPrice) || 0,
                discountedPrice: newDiscountedPrice ? Number(newDiscountedPrice) : null,
                isExtra: newIsExtra,
                image: url,
            })
            setItems([...items, { id: docRef.id, title: newTitle, description: newDesc, price: Number(newPrice) || 0, discountedPrice: newDiscountedPrice ? Number(newDiscountedPrice) : null, isExtra: newIsExtra, image: url }])
            setShowAdd(false)
            setNewTitle(""); setNewDesc(""); setNewPrice(""); setNewDiscountedPrice(""); setNewIsExtra(false); setSelectedFile(null)
            toast.success("Yeni hizmet başarıyla eklendi.")
        } catch (error: any) {
            console.error(error); toast.error(error?.message || "Hizmet eklenemedi.")
        } finally {
            setUploading(false)
        }
    }

    const startEdit = (item: any) => {
        setEditingId(item.id)
        setEditTitle(item.title || "")
        setEditDesc(item.description || "")
        setEditPrice(item.price != null ? String(item.price) : "")
        setEditDiscountedPrice(item.discountedPrice != null ? String(item.discountedPrice) : "")
        setEditIsExtra(!!item.isExtra)
    }

    const handleUpdate = async (id: string) => {
        if (!editTitle) return toast.error("Başlık boş olamaz.")
        try {
            const updates = {
                title: editTitle,
                description: editDesc,
                price: Number(editPrice) || 0,
                discountedPrice: editDiscountedPrice ? Number(editDiscountedPrice) : null,
                isExtra: editIsExtra,
            }
            await updateDoc(doc(db, 'services', id), updates)
            setItems(items.map(i => i.id === id ? { ...i, ...updates } : i))
            setEditingId(null)
            toast.success("Hizmet güncellendi.")
        } catch (error: any) {
            console.error(error); toast.error("Güncelleme başarısız: " + (error?.message || ""))
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return
        try {
            await deleteDoc(doc(db, 'services', id))
            setItems(items.filter(i => i.id !== id))
            toast.success("Hizmet silindi.")
        } catch (error: any) {
            console.error(error); toast.error("Silme işlemi başarısız: " + (error?.message || ""))
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" /></div>

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hizmet Paketleri Yönetimi</h1>
                    <p className="text-gray-500">Ana sayfada listelenen teklifleri buradan güncelleyin.</p>
                </div>
                <button 
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 bg-[#D49A73] hover:bg-[#c2845c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? 'Kapat' : 'Hizmet Ekle'}
                </button>
            </div>

            {showAdd && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-orange-100 p-6 md:p-8">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Hizmet Başlığı</label>
                                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:border-[#D49A73]" placeholder="Örn: Save The Date Çekimi" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Hizmet Görseli</label>
                                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50 transition-all">
                                    <UploadCloud className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-500 truncate">{selectedFile ? selectedFile.name : 'Dosya Seç'}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Normal Fiyat (TL)</label>
                                <input type="number" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:border-[#D49A73]" placeholder="Örn: 10000" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">İndirimli Fiyat (TL) - <span className="text-xs text-gray-400 font-normal">İsteğe Bağlı</span></label>
                                <input type="number" value={newDiscountedPrice} onChange={(e) => setNewDiscountedPrice(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:border-[#D49A73]" placeholder="Örn: 8500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Kısa Açıklama</label>
                            <textarea rows={2} required value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:border-[#D49A73] resize-none" placeholder="Hizmet hakkında kısa bilgi..." />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <input 
                                type="checkbox" 
                                id="isExtra" 
                                checked={newIsExtra} 
                                onChange={(e) => setNewIsExtra(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-[#D49A73] focus:ring-[#D49A73]"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="isExtra" className="text-sm font-semibold text-gray-800 cursor-pointer">Bu bir "Ekstra Hizmet" mi?</label>
                                <span className="text-xs text-gray-500">Seçerseniz bu hizmet ana paket olarak değil, sepete eklenebilir ekstra bir ürün olarak listelenir (Örn: Albüm, Drone).</span>
                            </div>
                        </div>
                        <button type="submit" disabled={uploading} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-[#D49A73] transition-colors flex items-center justify-center gap-2 group">
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sisteme Ekle'}
                        </button>
                    </form>
                </motion.div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm md:text-base">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between text-gray-800 font-semibold">
                    Aktif Hizmetler
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-gray-50 text-gray-400 text-xs uppercase"><th className="px-6 py-4">Kapak</th><th className="px-6 py-4">Başlık</th><th className="px-6 py-4">Açıklama</th><th className="px-6 py-4 text-right">İşlemler</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4"><div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"><img src={item.image} className="w-full h-full object-cover" /></div></td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <div className="space-y-2 min-w-[200px]">
                                                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-lg border-gray-300 border p-1.5 text-sm outline-none focus:border-[#D49A73]" placeholder="Başlık" />
                                                <div className="flex items-center gap-2">
                                                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-24 rounded-lg border-gray-300 border p-1.5 text-xs outline-none focus:border-[#D49A73]" placeholder="Fiyat" />
                                                    <input type="number" value={editDiscountedPrice} onChange={(e) => setEditDiscountedPrice(e.target.value)} className="w-24 rounded-lg border-gray-300 border p-1.5 text-xs outline-none focus:border-[#D49A73]" placeholder="İndirimli" />
                                                </div>
                                                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                    <input type="checkbox" checked={editIsExtra} onChange={(e) => setEditIsExtra(e.target.checked)} className="rounded border-gray-300 text-[#D49A73] focus:ring-[#D49A73]" />
                                                    Ekstra hizmet
                                                </label>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="font-semibold text-gray-900">{item.title}</div>
                                                    {item.isExtra && (
                                                        <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">EKSTRA</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.discountedPrice ? (
                                                        <>
                                                            <span className="text-[10px] font-bold text-gray-400 line-through">{item.price?.toLocaleString('tr-TR')} TL</span>
                                                            <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">{item.discountedPrice?.toLocaleString('tr-TR')} TL</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[11px] font-bold text-[#D49A73] uppercase tracking-wider">{item.price?.toLocaleString('tr-TR')} TL</span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full rounded-lg border-gray-300 border p-1.5 text-sm outline-none focus:border-[#D49A73] resize-none max-w-sm" placeholder="Açıklama" />
                                        ) : (
                                            <div className="text-gray-500 line-clamp-1 max-w-sm">{item.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingId === item.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(item.id)} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Kaydet"><CheckCircle className="w-5 h-5" /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors" title="İptal"><X className="w-5 h-5" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-[#D49A73] transition-colors p-2 hover:bg-orange-50 rounded-lg" title="Düzenle"><Edit className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg" title="Sil"><Trash2 className="w-5 h-5" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Henüz hizmet eklenmemiş.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
