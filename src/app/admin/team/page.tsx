"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Loader2, X, UploadCloud, CheckCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/upload'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminTeamPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showAdd, setShowAdd] = useState(false)

    const [newName, setNewName] = useState("")
    const [newRole, setNewRole] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Düzenleme durumları
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editRole, setEditRole] = useState("")

    useEffect(() => {
        fetchTeam()
    }, [])

    const fetchTeam = async () => {
        setLoading(true)
        try {
            const snap = await getDocs(collection(db, 'team'))
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error); toast.error("Ekip üyeleri yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile || !newName) return toast.error("Lütfen resim ve isim girin.")

        setUploading(true)
        try {
            const url = await uploadImage(selectedFile, 'team')
            const docRef = await addDoc(collection(db, 'team'), {
                name: newName,
                role: newRole,
                image: url,
            })
            setItems([...items, { id: docRef.id, name: newName, role: newRole, image: url }])
            setShowAdd(false)
            setNewName(""); setNewRole(""); setSelectedFile(null)
            toast.success("Ekip üyesi başarıyla eklendi.")
        } catch (error) {
            console.error(error); toast.error("Ekip üyesi eklenemedi.")
        } finally {
            setUploading(false)
        }
    }

    const startEdit = (member: any) => {
        setEditingId(member.id)
        setEditName(member.name || "")
        setEditRole(member.role || "")
    }

    const handleUpdate = async (id: string) => {
        if (!editName) return toast.error("İsim boş olamaz.")
        try {
            const updates = { name: editName, role: editRole }
            await updateDoc(doc(db, 'team', id), updates)
            setItems(items.map(i => i.id === id ? { ...i, ...updates } : i))
            setEditingId(null)
            toast.success("Ekip üyesi güncellendi.")
        } catch (error: any) {
            console.error(error); toast.error("Güncelleme başarısız.")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ekip üyesini silmek istediğinize emin misiniz?")) return
        try {
            await deleteDoc(doc(db, 'team', id))
            setItems(items.filter(i => i.id !== id))
            toast.success("Üye silindi.")
        } catch (error) {
            console.error(error); toast.error("Silme işlemi başarısız.")
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" /></div>

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ekip Yönetimi</h1>
                    <p className="text-gray-500">Ana sayfadaki 'Uzman Ekibimiz' kısmını buradan yönetin.</p>
                </div>
                <button 
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 bg-[#D49A73] hover:bg-[#c2845c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? 'İptal' : 'Yeni Üye Ekle'}
                </button>
            </div>

            {showAdd && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-md border border-orange-100 p-6 md:p-8">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Üye Adı Soyadı</label>
                                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-lg border-gray-300 border p-3 outline-none focus:border-[#D49A73]" placeholder="Örn: Ahmet Yılmaz" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Unvan / Rol</label>
                                <input type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full rounded-lg border-gray-300 border p-3 outline-none focus:border-[#D49A73]" placeholder="Örn: Baş Fotoğrafçı" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Profil Fotoğrafı</label>
                                <label className="flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-orange-50 transition-all">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-500 truncate px-4">{selectedFile ? selectedFile.name : 'Vesikalık/Portre Fotoğrafı Seç'}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                </label>
                            </div>
                            <button type="submit" disabled={uploading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-[#D49A73] transition-colors flex items-center justify-center gap-2">
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kaydet ve Yayınla'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((member) => (
                    <div key={member.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 italic">
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => startEdit(member)} className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" title="Düzenle">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(member.id)} className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" title="Sil">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 text-center">
                            {editingId === member.id ? (
                                <div className="space-y-2">
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border-gray-300 border p-1.5 text-sm text-center outline-none focus:border-[#D49A73]" placeholder="Ad Soyad" />
                                    <input value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full rounded-lg border-gray-300 border p-1.5 text-xs text-center outline-none focus:border-[#D49A73]" placeholder="Unvan / Rol" />
                                    <div className="flex items-center justify-center gap-2 pt-1">
                                        <button onClick={() => handleUpdate(member.id)} className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Kaydet"><CheckCircle className="w-5 h-5" /></button>
                                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="İptal"><X className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{member.name}</h3>
                                    <p className="text-[#D49A73] text-xs font-semibold uppercase tracking-wider mt-1">{member.role}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 text-center text-gray-400">
                    Henüz ekip üyesi eklenmemiş. Aşağıdaki butondan başlayın.
                </div>
            )}
        </div>
    )
}
