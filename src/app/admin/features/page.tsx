"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const iconOptions = [
    { value: 'Camera', label: 'Kamera' },
    { value: 'Aperture', label: 'Diyafram' },
    { value: 'Heart', label: 'Kalp' },
    { value: 'Lightbulb', label: 'Fikir / Işık' },
    { value: 'Target', label: 'Hedef' },
    { value: 'PenTool', label: 'Kalem / Tasarım' },
]

export default function AdminFeaturesPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchFeatures()
    }, [])

    const fetchFeatures = async () => {
        setLoading(true)
        try {
            const snap = await getDocs(collection(db, 'features'))
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error); toast.error("Özellikler yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        try {
            const newFeature = {
                title: "Yeni Özellik",
                desc: "Özellik açıklaması buraya gelecek.",
                icon: "Camera",
                isActive: false
            }
            const docRef = await addDoc(collection(db, 'features'), newFeature)
            setItems([...items, { id: docRef.id, ...newFeature }])
            toast.success("Yeni özellik eklendi.")
        } catch (error) {
            console.error(error); toast.error("Ekleme hatası.")
        }
    }

    const handleUpdate = async (id: string, updates: any) => {
        try {
            await updateDoc(doc(db, 'features', id), updates)
            setItems(items.map(i => i.id === id ? { ...i, ...updates } : i))
            toast.success("Güncellendi")
        } catch (error) {
            console.error(error); toast.error("Güncelleme hatası.")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return
        try {
            await deleteDoc(doc(db, 'features', id))
            setItems(items.filter(i => i.id !== id))
            toast.success("Silindi")
        } catch (error) {
            console.error(error); toast.error("Silme hatası.")
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" /></div>

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Neden Biz (Özellikler)</h1>
                    <p className="text-gray-500">Ana sayfadaki 6'lı özellik ızgarasını buradan yönetin.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-[#D49A73] hover:bg-[#c2845c] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Özellik Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={`bg-white rounded-2xl border-2 transition-all p-6 ${item.isActive ? 'border-[#D49A73] shadow-lg shadow-orange-100' : 'border-gray-100 shadow-sm'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <select 
                                value={item.icon}
                                onChange={(e) => handleUpdate(item.id, { icon: e.target.value })}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none font-medium text-gray-700"
                            >
                                {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input 
                                type="text"
                                value={item.title}
                                onBlur={(e) => handleUpdate(item.id, { title: e.target.value })}
                                onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, title: e.target.value} : i))}
                                className="w-full text-lg font-bold text-gray-900 bg-transparent border-b border-transparent focus:border-[#D49A73] outline-none py-1"
                            />
                            <textarea 
                                rows={3}
                                value={item.desc}
                                onBlur={(e) => handleUpdate(item.id, { desc: e.target.value })}
                                onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, desc: e.target.value} : i))}
                                className="w-full text-sm text-gray-500 bg-transparent border-b border-transparent focus:border-[#D49A73] outline-none resize-none py-1"
                            />
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Vurgula (Renk Değişimi)</span>
                            <button 
                                onClick={() => handleUpdate(item.id, { isActive: !item.isActive })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${item.isActive ? 'bg-[#D49A73]' : 'bg-gray-200'}`}
                            >
                                <motion.div 
                                    animate={{ x: item.isActive ? 24 : 2 }}
                                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 text-center text-gray-400">
                    Henüz özellik eklenmemiş. "Yeni Özellik Ekle" butonuna basın.
                </div>
            )}
        </div>
    )
}
