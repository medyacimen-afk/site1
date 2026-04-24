"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Save, Loader2, X, UploadCloud, Sparkles, Eye, FileText, LayoutList } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { uploadImage } from '@/lib/upload'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list')
    const [previewMode, setPreviewMode] = useState(false)

    // Form State
    const [editId, setEditId] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [image, setImage] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [topic, setTopic] = useState("") // For AI

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'blog_posts'), orderBy('date', 'desc'))
            const snap = await getDocs(q)
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error); toast.error("Yazılar yüklenemedi.")
        } finally {
            setLoading(false)
        }
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/-+/g, '-')
    }

    const handleTitleChange = (val: string) => {
        setTitle(val)
        if (!editId) setSlug(generateSlug(val))
    }

    const handleGenerateAI = async () => {
        if (!topic) return toast.error("Lütfen bir konu başlığı girin.")
        setGenerating(true)
        try {
            const res = await fetch('/api/blog/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setTitle(data.title)
            setSlug(generateSlug(data.title))
            setExcerpt(data.excerpt)
            setContent(data.content)
            toast.success("Yazı başarıyla oluşturuldu!")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "AI üretim hatası. API anahtarını kontrol edin.")
        } finally {
            setGenerating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        try {
            let imageUrl = image
            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile, 'blog')
            }

            const postData = {
                title,
                slug,
                excerpt,
                content,
                image: imageUrl,
                date: new Date().toISOString(),
                status: 'published', // Defaulting to published for now
                author: 'Duru Foto'
            }

            if (editId) {
                await updateDoc(doc(db, 'blog_posts', editId), postData)
                toast.success("Yazı güncellendi.")
            } else {
                await addDoc(collection(db, 'blog_posts'), postData)
                toast.success("Yazı yayınlandı.")
            }

            resetForm()
            fetchPosts()
            setViewMode('list')
        } catch (error) {
            console.error(error); toast.error("İşlem başarısız.")
        } finally {
            setUploading(false)
        }
    }

    const handleEdit = (post: any) => {
        setEditId(post.id)
        setTitle(post.title)
        setSlug(post.slug)
        setExcerpt(post.excerpt)
        setContent(post.content)
        setImage(post.image)
        setViewMode('edit')
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return
        try {
            await deleteDoc(doc(db, 'blog_posts', id))
            setPosts(posts.filter(p => p.id !== id))
            toast.success("Yazı silindi.")
        } catch (error) {
            console.error(error); toast.error("Silme hatası.")
        }
    }

    const resetForm = () => {
        setEditId(null)
        setTitle("")
        setSlug("")
        setExcerpt("")
        setContent("")
        setImage("")
        setSelectedFile(null)
        setTopic("")
    }

    if (loading && posts.length === 0) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#D49A73]" /></div>

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5">
                <div>
                    <h1 className="text-3xl font-serif font-black tracking-tight text-gray-900">Blog Yönetimi</h1>
                    <p className="text-gray-400 italic text-sm">AI destekli içerik üretimi ve blog yönetimi.</p>
                </div>
                {viewMode === 'list' ? (
                    <button 
                        onClick={() => { resetForm(); setViewMode('edit') }}
                        className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#D49A73] transition-all shadow-xl shadow-black/10 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Yeni Yazı Ekle
                    </button>
                ) : (
                    <button 
                        onClick={() => setViewMode('list')}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        <LayoutList className="w-5 h-5" /> Listeye Dön
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                <div className="aspect-video relative overflow-hidden bg-gray-100">
                                    <img src={post.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={() => handleEdit(post)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow text-gray-600 hover:text-black hover:bg-white transition-all"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#D49A73]">
                                        <FileText className="w-3 h-3" /> {format(new Date(post.date), 'd MMM yyyy', { locale: tr })}
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-[#D49A73] transition-colors leading-tight">{post.title}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 italic">{post.excerpt}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="edit"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* AI Generator Section */}
                        {!editId && (
                            <div className="bg-gradient-to-br from-indigo-50 via-white to-orange-50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">AI Yazı Sihirbazı</h2>
                                        <p className="text-xs text-indigo-400 font-medium">Gemini 2.0 Flash ile saniyeler içinde makale üretin.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Konu başlığını girin... (Örn: Sivas'ta dış çekim rotaları)"
                                        className="flex-1 px-6 py-4 rounded-2xl border-indigo-100 border bg-white outline-none focus:border-indigo-500 shadow-sm"
                                    />
                                    <button 
                                        onClick={handleGenerateAI}
                                        disabled={generating}
                                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                                    >
                                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Oluştur</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Editor Form */}
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm md:text-base">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Yazı Başlığı</label>
                                    <input required value={title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-6 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#D49A73] transition-all outline-none font-bold" placeholder="SEO uyumlu başlık..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Giriş Özeti (Excerpt)</label>
                                    <textarea required rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full px-6 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#D49A73] transition-all outline-none italic text-sm" placeholder="Yazının kısa özeti..." />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">İçerik (Markdown)</label>
                                        <button type="button" onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline px-4">
                                            {previewMode ? <><LayoutList className="w-3 h-3" /> Düzenle</> : <><Eye className="w-3 h-3" /> Önizleme</>}
                                        </button>
                                    </div>
                                    <div className="min-h-[400px]">
                                        {previewMode ? (
                                            <div className="prose prose-sm max-w-none p-8 bg-gray-50 border border-gray-100 rounded-[2rem] min-h-[400px]">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <textarea 
                                                required 
                                                rows={15} 
                                                value={content} 
                                                onChange={(e) => setContent(e.target.value)} 
                                                className="w-full px-8 py-6 rounded-[2rem] border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#D49A73] transition-all outline-none font-mono text-sm leading-relaxed" 
                                                placeholder="# Başlık&#10;Metni buraya yazın..." 
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Slug (URL)</label>
                                    <input required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-6 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 text-xs font-mono" placeholder="yazi-basligi-buraya" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Kapak Görseli</label>
                                    <div className="space-y-4">
                                        {image && <img src={image} className="w-full aspect-video object-cover rounded-2xl border border-black/5" />}
                                        <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-orange-50 hover:border-[#D49A73] transition-all group">
                                            <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#D49A73]" />
                                            <span className="text-sm text-gray-500 font-medium group-hover:text-[#D49A73]">{selectedFile ? selectedFile.name : 'Görsel Yükle'}</span>
                                            <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <button 
                                        type="submit" 
                                        disabled={uploading}
                                        className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-black/10 active:scale-95"
                                    >
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {editId ? 'Güncelle' : 'Hemen Yayınla'}</>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
