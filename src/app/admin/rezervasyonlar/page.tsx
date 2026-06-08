"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, X, Save, Loader2, Phone, MessageCircle, Trash2,
    ChevronDown, ChevronUp, Search, Calendar, MapPin,
    User, Users, Banknote, FileText, CheckCircle2, XCircle, Clock
} from 'lucide-react'
import { db } from '@/lib/firebase'
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc,
    doc, query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// ─── Etkinlik türleri ────────────────────────────────────────────────────────
const EVENT_TYPES = [
    { id: 'dugun', label: 'Düğün', emoji: '💒' },
    { id: 'nisan', label: 'Nişan', emoji: '💍' },
    { id: 'kina', label: 'Kına Gecesi', emoji: '🌿' },
    { id: 'sunnet', label: 'Sünnet', emoji: '🎈' },
    { id: 'iris', label: 'İris Çekimi', emoji: '👁️' },
    { id: 'klip', label: 'Klip Çekimi', emoji: '🎬' },
    { id: 'dis_cekim', label: 'Dış Çekim', emoji: '🌄' },
    { id: 'bebek', label: 'Bebek / Hamile', emoji: '👶' },
    { id: 'mezuniyet', label: 'Mezuniyet', emoji: '🎓' },
    { id: 'diger', label: 'Diğer', emoji: '📷' },
]

const STATUS_OPTIONS = [
    { id: 'confirmed', label: 'Onaylandı', color: 'bg-blue-100 text-blue-700' },
    { id: 'completed', label: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
    { id: 'cancelled', label: 'İptal', color: 'bg-red-100 text-red-700' },
    { id: 'pending', label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
]

const SOURCES = ['Instagram', 'Tavsiye', 'Google', 'Facebook', 'TikTok', 'Saha Çalışması', 'Diğer']

const EMPTY_FORM = {
    brideName: '', groomName: '', bridePhone: '', groomPhone: '',
    eventType: 'dugun', eventDate: '', eventTime: '',
    location: '', source: '', notes: '',
    totalAmount: '', depositAmount: '',
    status: 'confirmed',
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function fmtMoney(n: number) {
    return n.toLocaleString('tr-TR') + ' ₺'
}
function eventLabel(id: string) {
    return EVENT_TYPES.find(e => e.id === id) || { label: id, emoji: '📷' }
}
function statusBadge(status: string) {
    const s = STATUS_OPTIONS.find(x => x.id === status)
    if (!s) return null
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.color}`}>{s.label}</span>
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────
export default function AdminRezervasyon() {
    const [reservations, setReservations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM })
    const [waLinks, setWaLinks] = useState<{ bride: string; groom: string } | null>(null)

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'))
            const snap = await getDocs(q)
            setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (e) {
            console.error(e)
            toast.error('Rezervasyonlar yüklenemedi.')
        } finally {
            setLoading(false)
        }
    }

    const openNew = () => {
        setForm({ ...EMPTY_FORM })
        setEditingId(null)
        setWaLinks(null)
        setShowForm(true)
    }

    const openEdit = (r: any) => {
        setForm({
            brideName: r.brideName || '',
            groomName: r.groomName || '',
            bridePhone: r.bridePhone || '',
            groomPhone: r.groomPhone || '',
            eventType: r.eventType || 'dugun',
            eventDate: r.eventDate || '',
            eventTime: r.eventTime || '',
            location: r.location || '',
            source: r.source || '',
            notes: r.notes || '',
            totalAmount: r.totalAmount?.toString() || '',
            depositAmount: r.depositAmount?.toString() || '',
            status: r.status || 'confirmed',
        })
        setEditingId(r.id)
        setWaLinks(null)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.brideName.trim()) { toast.error('Gelin adı zorunludur.'); return }
        if (!form.eventDate) { toast.error('Çekim tarihi zorunludur.'); return }
        setSaving(true)
        try {
            const total = parseFloat(form.totalAmount) || 0
            const deposit = parseFloat(form.depositAmount) || 0
            const data = {
                ...form,
                totalAmount: total,
                depositAmount: deposit,
                remainingAmount: total - deposit,
                updatedAt: serverTimestamp(),
            }
            let savedId = editingId

            if (editingId) {
                await updateDoc(doc(db, 'reservations', editingId), data)
                toast.success('Rezervasyon güncellendi.')
            } else {
                const ref = await addDoc(collection(db, 'reservations'), {
                    ...data,
                    createdAt: serverTimestamp(),
                })
                savedId = ref.id
                toast.success('Rezervasyon eklendi.')
            }

            // WhatsApp linklerini hazırla
            const evt = eventLabel(form.eventType)
            const msg = `Merhaba! Rezervasyonunuz oluşturulmuştur. 📅 Tarih: ${form.eventDate}${form.eventTime ? ' ' + form.eventTime : ''} 📍 Mekan: ${form.location || '-'} 🎉 Etkinlik: ${evt.emoji} ${evt.label} 💰 Toplam: ${fmtMoney(total)} ✅ Kapora: ${fmtMoney(deposit)} 💳 Kalan: ${fmtMoney(total - deposit)} ${form.notes ? '📝 Not: ' + form.notes : ''}`
            const encoded = encodeURIComponent(msg)
            setWaLinks({
                bride: form.bridePhone ? `https://wa.me/9${form.bridePhone.replace(/\D/g, '')}?text=${encoded}` : '',
                groom: form.groomPhone ? `https://wa.me/9${form.groomPhone.replace(/\D/g, '')}?text=${encoded}` : '',
            })

            await fetchAll()
        } catch (e) {
            console.error(e); toast.error('Kaydedilemedi.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) return
        setDeletingId(id)
        try {
            await deleteDoc(doc(db, 'reservations', id))
            setReservations(prev => prev.filter(r => r.id !== id))
            toast.success('Silindi.')
        } catch (e) {
            toast.error('Silinemedi.')
        } finally {
            setDeletingId(null)
        }
    }

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateDoc(doc(db, 'reservations', id), { status, updatedAt: serverTimestamp() })
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        } catch { toast.error('Güncellenemedi.') }
    }

    // Filtrele
    const filtered = reservations.filter(r => {
        const q = search.toLowerCase()
        const matchSearch = !q || [r.brideName, r.groomName, r.bridePhone, r.groomPhone, r.location]
            .some(v => (v || '').toLowerCase().includes(q))
        const matchType = filterType === 'all' || r.eventType === filterType
        const matchStatus = filterStatus === 'all' || r.status === filterStatus
        return matchSearch && matchType && matchStatus
    })

    // Özet sayılar
    const totals = reservations.reduce((acc, r) => ({
        total: acc.total + (r.totalAmount || 0),
        deposit: acc.deposit + (r.depositAmount || 0),
        remaining: acc.remaining + (r.remainingAmount || 0),
    }), { total: 0, deposit: 0, remaining: 0 })

    return (
        <div className="space-y-6">
            {/* Başlık */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900">📅 Rezervasyonlar</h1>
                    <p className="text-gray-400 text-sm mt-1">Manuel rezervasyon ekle, düzenle ve takip et</p>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #CAAE78, #B09050)' }}>
                    <Plus className="w-4 h-4" /> Rezervasyon Ekle
                </button>
            </div>

            {/* Özet kartlar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Toplam Ciro', value: fmtMoney(totals.total), color: '#B09050' },
                    { label: 'Alınan Kapora', value: fmtMoney(totals.deposit), color: '#16a34a' },
                    { label: 'Kalan Bakiye', value: fmtMoney(totals.remaining), color: '#d97706' },
                ].map(c => (
                    <div key={c.label} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">{c.label}</p>
                        <p className="text-xl font-black" style={{ color: c.color }}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[160px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, telefon, mekan..."
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#CAAE78]" />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#CAAE78]">
                    <option value="all">Tüm Türler</option>
                    {EVENT_TYPES.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#CAAE78]">
                    <option value="all">Tüm Durumlar</option>
                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#B09050]" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-gray-500 font-semibold">Rezervasyon bulunamadı</p>
                    <p className="text-sm text-gray-400 mt-1">Yukarıdaki butona tıklayarak ekleyin</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(r => {
                        const evt = eventLabel(r.eventType)
                        const isExpanded = expandedId === r.id
                        const remaining = (r.totalAmount || 0) - (r.depositAmount || 0)
                        return (
                            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                {/* Kart başlığı */}
                                <div className="p-4 flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-amber-50">
                                        {evt.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-gray-900">{r.brideName}{r.groomName ? ` & ${r.groomName}` : ''}</span>
                                            <span className="text-xs text-gray-400 font-medium">{evt.label}</span>
                                            {statusBadge(r.status)}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                                            {r.eventDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.eventDate}{r.eventTime ? ' · ' + r.eventTime : ''}</span>}
                                            {r.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span>}
                                            {r.totalAmount > 0 && <span className="font-semibold text-[#B09050]">{fmtMoney(r.totalAmount)}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                            className="p-1.5 text-gray-400 hover:text-gray-700">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Detay */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                                        {/* Kişi bilgileri */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {r.bridePhone && (
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Gelin Telefonu</p>
                                                    <a href={`tel:${r.bridePhone}`} className="font-semibold text-gray-800 hover:text-[#B09050]">{r.bridePhone}</a>
                                                </div>
                                            )}
                                            {r.groomPhone && (
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Damat Telefonu</p>
                                                    <a href={`tel:${r.groomPhone}`} className="font-semibold text-gray-800 hover:text-[#B09050]">{r.groomPhone}</a>
                                                </div>
                                            )}
                                            {r.source && (
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Nereden Geldi</p>
                                                    <p className="font-semibold text-gray-800">{r.source}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Finans */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Toplam', value: r.totalAmount, color: 'text-gray-800' },
                                                { label: 'Kapora', value: r.depositAmount, color: 'text-green-600' },
                                                { label: 'Kalan', value: remaining, color: remaining > 0 ? 'text-amber-600' : 'text-green-600' },
                                            ].map(f => (
                                                <div key={f.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{f.label}</p>
                                                    <p className={`font-black text-base ${f.color}`}>{fmtMoney(f.value || 0)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Notlar */}
                                        {r.notes && (
                                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Notlar</p>
                                                <p className="text-sm text-gray-700">{r.notes}</p>
                                            </div>
                                        )}

                                        {/* Durum değiştir */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs text-gray-400 font-semibold">Durum:</p>
                                            {STATUS_OPTIONS.map(s => (
                                                <button key={s.id} onClick={() => handleStatusChange(r.id, s.id)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${r.status === s.id ? s.color : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Aksiyonlar */}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {r.bridePhone && (
                                                <a href={`https://wa.me/9${r.bridePhone.replace(/\D/g, '')}?text=${encodeURIComponent('Merhaba ' + r.brideName + '!')}`}
                                                    target="_blank" rel="noopener"
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100">
                                                    <MessageCircle className="w-3.5 h-3.5" /> Gelinle WhatsApp
                                                </a>
                                            )}
                                            {r.groomPhone && (
                                                <a href={`https://wa.me/9${r.groomPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Merhaba ' + r.groomName + '!')}`}
                                                    target="_blank" rel="noopener"
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100">
                                                    <MessageCircle className="w-3.5 h-3.5" /> Damatla WhatsApp
                                                </a>
                                            )}
                                            <button onClick={() => openEdit(r)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                Düzenle
                                            </button>
                                            <button onClick={() => handleDelete(r.id)}
                                                disabled={deletingId === r.id}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100">
                                                {deletingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Sil
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ─── FORM MODAL ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
                        onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl my-8 shadow-2xl">

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-gray-900">
                                    {editingId ? 'Rezervasyonu Düzenle' : '+ Yeni Rezervasyon'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* WhatsApp başarı mesajı */}
                            {waLinks && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl space-y-3">
                                    <p className="font-bold text-green-700 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Rezervasyon kaydedildi! Bilgileri WhatsApp ile gönderin:
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        {waLinks.bride && (
                                            <a href={waLinks.bride} target="_blank" rel="noopener"
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
                                                style={{ background: '#25D366' }}>
                                                <MessageCircle className="w-4 h-4" /> Gelinle Paylaş
                                            </a>
                                        )}
                                        {waLinks.groom && (
                                            <a href={waLinks.groom} target="_blank" rel="noopener"
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
                                                style={{ background: '#25D366' }}>
                                                <MessageCircle className="w-4 h-4" /> Damatla Paylaş
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Etkinlik türü */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Etkinlik Türü</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EVENT_TYPES.map(e => (
                                            <button key={e.id} type="button"
                                                onClick={() => setForm(f => ({ ...f, eventType: e.id }))}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${form.eventType === e.id ? 'border-[#B09050] bg-amber-50 text-[#B09050]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                {e.emoji} {e.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Kişiler */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Gelin Adı Soyadı *" value={form.brideName} onChange={v => setForm(f => ({ ...f, brideName: v }))} placeholder="Ad Soyad" />
                                    <Field label="Damat Adı Soyadı" value={form.groomName} onChange={v => setForm(f => ({ ...f, groomName: v }))} placeholder="Ad Soyad" />
                                    <Field label="Gelin Telefonu" value={form.bridePhone} onChange={v => setForm(f => ({ ...f, bridePhone: v }))} placeholder="0501 234 56 78" type="tel" />
                                    <Field label="Damat Telefonu" value={form.groomPhone} onChange={v => setForm(f => ({ ...f, groomPhone: v }))} placeholder="0501 234 56 78" type="tel" />
                                </div>

                                {/* Çekim bilgileri */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field label="Çekim Tarihi *" value={form.eventDate} onChange={v => setForm(f => ({ ...f, eventDate: v }))} type="date" />
                                    <Field label="Çekim Saati" value={form.eventTime} onChange={v => setForm(f => ({ ...f, eventTime: v }))} type="time" />
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Nereden Geldi</label>
                                        <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]">
                                            <option value="">Seç...</option>
                                            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <Field label="Çekim Mekanı" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="Mekan adı veya adresi" />

                                {/* Finans */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field label="Toplam Tutar (₺)" value={form.totalAmount} onChange={v => setForm(f => ({ ...f, totalAmount: v }))} placeholder="0" type="number" />
                                    <Field label="Alınan Kapora (₺)" value={form.depositAmount} onChange={v => setForm(f => ({ ...f, depositAmount: v }))} placeholder="0" type="number" />
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Kalan Tutar</label>
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-black text-amber-700">
                                            {fmtMoney((parseFloat(form.totalAmount) || 0) - (parseFloat(form.depositAmount) || 0))}
                                        </div>
                                    </div>
                                </div>

                                {/* Durum */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Durum</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]">
                                        {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>

                                {/* Notlar */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Çekim Notları</label>
                                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                                        placeholder="Özel istekler, ekipman notları, ulaşım bilgisi..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78] resize-none" />
                                </div>

                                {/* Butonlar */}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowForm(false)}
                                        className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200">
                                        Vazgeç
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #CAAE78, #B09050)' }}>
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {editingId ? 'Güncelle' : 'Kaydet & WhatsApp Gönder'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Input yardımcısı ─────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder = '', type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
    return (
        <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78] transition-colors" />
        </div>
    )
}
