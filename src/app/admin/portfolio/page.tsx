"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit, Save, UploadCloud, Loader2, X, CheckCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/upload'
import { toast } from 'sonner'

export default function AdminPortfolioPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Form states
    const [newTitle, setNewTitle] = useState("")
    const [newCategory, setNewCategory] = useState("Düğün Hikayesi")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Editing states
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editCategory, setEditCategory] = useState("")

    // Bulk action states
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [bulkCategory, setBulkCategory] = useState("")
    const [isBulkUpdating, setIsBulkUpdating] = useState(false)

    useEffect(() => {
        fetchPortfolio()
    }, [])

    const fetchPortfolio = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'))
            const snap = await getDocs(q)
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error)
            toast.error("Portfolyo yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile || !newTitle) return toast.error("Lütfen resim ve başlık seçin.")

        setUploading(true)
        try {
            const url = await uploadImage(selectedFile, 'portfolio')
            const docRef = await addDoc(collection(db, 'portfolio'), {
                title: newTitle,
                category: newCategory,
                image: url,
                isHome: false,
                createdAt: new Date().toISOString()
            })
            setItems([{ id: docRef.id, title: newTitle, category: newCategory, image: url, isHome: false }, ...items])
            setShowAdd(false)
            setNewTitle("")
            setSelectedFile(null)
            toast.success("Yeni çalışma eklendi.")
        } catch (error) {
            console.error(error)
            toast.error("Çalışma eklenemedi.")
        } finally {
            setUploading(false)
        }
    }

    const handleUpdate = async (id: string) => {
        if (!editTitle) return toast.error("Başlık boş olamaz.")
        try {
            await updateDoc(doc(db, 'portfolio', id), {
                title: editTitle,
                category: editCategory
            })
            setItems(items.map(i => i.id === id ? { ...i, title: editTitle, category: editCategory } : i))
            setEditingId(null)
            toast.success("Çalışma güncellendi.")
        } catch (error) {
            console.error(error)
            toast.error("Güncelleme başarısız.")
        }
    }

    const handleToggleHome = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, 'portfolio', id), {
                isHome: !currentStatus
            })
            setItems(items.map(i => i.id === id ? { ...i, isHome: !currentStatus } : i))
            toast.success(currentStatus ? "Anasayfadan kaldırıldı." : "Anasayfaya eklendi.")
        } catch (error) {
            console.error(error)
            toast.error("İşlem başarısız.")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu çalışmayı kalıcı olarak silmek istediğinize emin misiniz?")) return
        try {
            await deleteDoc(doc(db, 'portfolio', id))
            setItems(items.filter(i => i.id !== id))
            setSelectedItems(selectedItems.filter(itemId => itemId !== id))
            toast.success("Çalışma silindi.")
        } catch (error) {
            console.error(error)
            toast.error("Silme işlemi başarısız.")
        }
    }

    const toggleSelection = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleAllSelection = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(items.map(i => i.id))
        }
    }

    const handleBulkCategoryUpdate = async () => {
        if (!bulkCategory) return toast.error("Lütfen uygulanacak kategoriyi yazın.")
        if (selectedItems.length === 0) return toast.error("Hiç görsel seçmediniz.")
        
        setIsBulkUpdating(true)
        try {
            await Promise.all(selectedItems.map(id => 
                updateDoc(doc(db, 'portfolio', id), { category: bulkCategory })
            ))
            setItems(items.map(i => selectedItems.includes(i.id) ? { ...i, category: bulkCategory } : i))
            setSelectedItems([])
            setBulkCategory("")
            toast.success(`${selectedItems.length} görselin kategorisi başarıyla güncellendi!`)
        } catch (error) {
            console.error(error)
            toast.error("Toplu güncelleme sırasında hata oluştu.")
        } finally {
            setIsBulkUpdating(false)
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Portfolyo Yönetimi</h1>
                    <p className="text-gray-500">Anasayfadaki portfolyo ızgarasını buradan düzenleyin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/portfolio/import"
                        className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Toplu İçe Aktar
                    </Link>
                    <button 
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-2 bg-[#D49A73] hover:bg-[#c2845c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {showAdd ? 'Kapat' : 'Yeni Ekle'}
                    </button>
                </div>
            </div>

            {/* Add New Form */}
            {showAdd && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md border border-orange-100 p-6 md:p-8"
                >
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Çalışma Başlığı</label>
                            <input 
                                type="text"
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-[#D49A73] focus:border-[#D49A73] outline-none"
                                placeholder="Örn: Sivas Tarihi Mekan Çekimi"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Kategori</label>
                            <select 
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-[#D49A73] focus:border-[#D49A73] outline-none"
                            >
                                <option value="Düğün Hikayesi">Düğün Hikayesi</option>
                                <option value="Nişan & Sünnet">Nişan & Sünnet</option>
                                <option value="Gelin Alma">Gelin Alma</option>
                                <option value="Save the Date">Save the Date</option>
                                <option value="Plato Çekimleri">Plato Çekimleri</option>
                                <option value="Evlilik Teklifi">Evlilik Teklifi</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Resim Seç</label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-[#D49A73] transition-all overflow-hidden group">
                                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-[#D49A73]" />
                                    <span className="text-sm text-gray-500 truncate">
                                        {selectedFile ? selectedFile.name : 'Dosya Seç'}
                                    </span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                                <button 
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-black text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#D49A73] transition-colors disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yükle'}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-gray-800">Ekli Çalışmalar</h2>
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{items.length} Öğe</span>
                    </div>

                    {/* Bulk Action Bar */}
                    <AnimatePresence>
                        {selectedItems.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100"
                            >
                                <span className="text-sm font-semibold text-[#D49A73]">{selectedItems.length} seçili</span>
                                <select 
                                    value={bulkCategory}
                                    onChange={(e) => setBulkCategory(e.target.value)}
                                    className="text-sm rounded border-gray-300 p-1.5 focus:ring-[#D49A73] focus:border-[#D49A73] outline-none min-w-[180px]"
                                >
                                    <option value="" disabled>Kategori Seç...</option>
                                    <option value="Düğün Hikayesi">Düğün Hikayesi</option>
                                    <option value="Nişan & Sünnet">Nişan & Sünnet</option>
                                    <option value="Gelin Alma">Gelin Alma</option>
                                    <option value="Save the Date">Save the Date</option>
                                    <option value="Plato Çekimleri">Plato Çekimleri</option>
                                    <option value="Evlilik Teklifi">Evlilik Teklifi</option>
                                </select>
                                <button 
                                    onClick={handleBulkCategoryUpdate}
                                    disabled={isBulkUpdating}
                                    className="bg-[#D49A73] hover:bg-[#c2845c] text-white text-sm px-4 py-1.5 rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Toplu Değiştir
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 w-12">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-[#D49A73] focus:ring-[#D49A73]"
                                        checked={selectedItems.length > 0 && selectedItems.length === items.length}
                                        onChange={toggleAllSelection}
                                    />
                                </th>
                                <th className="px-6 py-4 font-medium">Görsel</th>
                                <th className="px-6 py-4 font-medium">Kategori</th>
                                <th className="px-6 py-4 font-medium">Başlık</th>
                                <th className="px-6 py-4 font-medium text-center">Anasayfa</th>
                                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedItems.includes(item.id) ? 'bg-orange-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-[#D49A73] focus:ring-[#D49A73]"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => toggleSelection(item.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-14 w-20 rounded-md overflow-hidden bg-gray-100 shadow-sm">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {editingId === item.id ? (
                                            <input 
                                                type="text"
                                                list="category-options"
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="rounded border-gray-300 p-1 text-sm outline-none focus:ring-1 focus:ring-primary w-full"
                                            />
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-[#D49A73]">
                                                {item.category}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <input 
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="w-full rounded border-gray-300 p-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => handleToggleHome(item.id, item.isHome)}
                                            className={`p-2 rounded-full transition-all ${
                                                item.isHome 
                                                    ? 'bg-orange-500 text-white shadow-md' 
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                            title={item.isHome ? "Anasayfadan Kaldır" : "Anasayfaya Ekle"}
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            {editingId === item.id ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdate(item.id)}
                                                        className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Kaydet"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingId(null)}
                                                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                                        title="İptal"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingId(item.id)
                                                            setEditTitle(item.title)
                                                            setEditCategory(item.category)
                                                        }}
                                                        className="text-gray-400 hover:text-primary p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        Henüz portfolyo öğesi bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {Math.ceil(items.length / itemsPerPage) > 1 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Toplam {items.length} kayıttan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, items.length)} arası gösteriliyor.
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-white border border-gray-200 text-sm disabled:opacity-50"
                            >
                                Önceki
                            </button>
                            <span className="text-sm font-semibold">{currentPage} / {Math.ceil(items.length / itemsPerPage)}</span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(items.length / itemsPerPage), p + 1))}
                                disabled={currentPage === Math.ceil(items.length / itemsPerPage)}
                                className="px-3 py-1 rounded bg-white border border-gray-200 text-sm disabled:opacity-50"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}
