"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Loader2, TrendingUp, TrendingDown, Wallet, Plus, Trash2,
    ChevronDown, ChevronUp, Calendar, Save, X
} from 'lucide-react'
import { db } from '@/lib/firebase'
import {
    collection, getDocs, addDoc, deleteDoc, doc,
    query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { toast } from 'sonner'

// ─── Etkinlik türleri (rezervasyonlar sayfasıyla aynı) ──────────────────────
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

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

function fmtMoney(n: number) {
    if (!n) return '0 ₺'
    return n.toLocaleString('tr-TR') + ' ₺'
}

export default function AdminMuhasebe() {
    const [reservations, setReservations] = useState<any[]>([])
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [year, setYear] = useState(new Date().getFullYear())
    const [expandedMonth, setExpandedMonth] = useState<number | null>(new Date().getMonth())
    const [showExpenseForm, setShowExpenseForm] = useState(false)
    const [savingExpense, setSavingExpense] = useState(false)
    const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '', category: 'ekipman' })

    const EXPENSE_CATS = ['Ekipman', 'Ulaşım', 'Kira', 'Personel', 'Reklam', 'Diğer']

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [resSnap, expSnap] = await Promise.all([
                getDocs(query(collection(db, 'reservations'), orderBy('eventDate', 'asc'))),
                getDocs(query(collection(db, 'expenses'), orderBy('date', 'asc'))),
            ])
            setReservations(resSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setExpenses(expSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const saveExpense = async () => {
        if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) {
            toast.error('Açıklama, tutar ve tarih zorunludur.'); return
        }
        setSavingExpense(true)
        try {
            await addDoc(collection(db, 'expenses'), {
                ...expenseForm,
                amount: parseFloat(expenseForm.amount),
                createdAt: serverTimestamp(),
            })
            toast.success('Gider eklendi.')
            setExpenseForm({ description: '', amount: '', date: '', category: 'ekipman' })
            setShowExpenseForm(false)
            await fetchAll()
        } catch { toast.error('Kaydedilemedi.') } finally { setSavingExpense(false) }
    }

    const deleteExpense = async (id: string) => {
        if (!confirm('Bu gideri silmek istediğinizden emin misiniz?')) return
        try {
            await deleteDoc(doc(db, 'expenses', id))
            setExpenses(prev => prev.filter(e => e.id !== id))
            toast.success('Silindi.')
        } catch { toast.error('Silinemedi.') }
    }

    // ─── Hesaplamalar ───────────────────────────────────────────────────────
    // Yıl bazlı rezervasyonlar (eventDate YYYY-MM-DD formatında)
    const yearRes = reservations.filter(r => r.eventDate?.startsWith(year.toString()) && r.status !== 'cancelled')
    const yearExp = expenses.filter(e => e.date?.startsWith(year.toString()))

    // Aylık breakdown
    const monthlyData = MONTHS.map((month, idx) => {
        const m = String(idx + 1).padStart(2, '0')
        const prefix = `${year}-${m}`
        const res = yearRes.filter(r => r.eventDate?.startsWith(prefix))
        const exps = yearExp.filter(e => e.date?.startsWith(prefix))

        const income = res.reduce((s, r) => s + (r.totalAmount || 0), 0)
        const deposit = res.reduce((s, r) => s + (r.depositAmount || 0), 0)
        const remaining = income - deposit
        const expTotal = exps.reduce((s, e) => s + (e.amount || 0), 0)
        const profit = deposit - expTotal

        return { month, idx, res, exps, income, deposit, remaining, expTotal, profit }
    })

    // Etkinlik türü bazlı yıllık özet
    const byType = EVENT_TYPES.map(et => {
        const res = yearRes.filter(r => r.eventType === et.id)
        const income = res.reduce((s, r) => s + (r.totalAmount || 0), 0)
        const deposit = res.reduce((s, r) => s + (r.depositAmount || 0), 0)
        return { ...et, count: res.length, income, deposit, remaining: income - deposit }
    }).filter(e => e.count > 0).sort((a, b) => b.income - a.income)

    // Yıllık toplamlar
    const totalIncome = yearRes.reduce((s, r) => s + (r.totalAmount || 0), 0)
    const totalDeposit = yearRes.reduce((s, r) => s + (r.depositAmount || 0), 0)
    const totalRemaining = totalIncome - totalDeposit
    const totalExpense = yearExp.reduce((s, e) => s + (e.amount || 0), 0)
    const netProfit = totalDeposit - totalExpense

    // Tüm zamanlar alacak (kalan ödeme bekleyen aktif rezervasyonlar)
    const allPendingRemaining = reservations
        .filter(r => r.status !== 'cancelled' && r.status !== 'completed' && (r.remainingAmount || 0) > 0)
        .reduce((s, r) => s + (r.remainingAmount || 0), 0)

    const currentYear = new Date().getFullYear()

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#B09050]" /></div>

    return (
        <div className="space-y-6 pb-20">
            {/* Başlık + yıl seçici */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900">💰 Muhasebe</h1>
                    <p className="text-gray-400 text-sm mt-1">Gelir, gider ve bakiye takibi</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-lg font-black text-gray-800 w-14 text-center">{year}</span>
                    <button onClick={() => setYear(y => y + 1)} disabled={year >= currentYear}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Yıllık özet kartlar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Ciro', value: fmtMoney(totalIncome), icon: TrendingUp, color: 'text-[#B09050]', bg: 'bg-amber-50' },
                    { label: 'Alınan Kapora', value: fmtMoney(totalDeposit), icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Beklenen Alacak', value: fmtMoney(totalRemaining), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Net Kâr', value: fmtMoney(netProfit), icon: netProfit >= 0 ? TrendingUp : TrendingDown, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                ].map(c => (
                    <div key={c.label} className={`${c.bg} rounded-2xl p-5 border border-black/5`}>
                        <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{c.label}</p>
                        <p className={`text-xl font-black mt-0.5 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Tüm zamanlardaki aktif alacak */}
            {allPendingRemaining > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                        <p className="font-bold text-amber-800">Tahsil Edilmemiş Bakiye</p>
                        <p className="text-sm text-amber-700">Aktif rezervasyonlarda beklenen toplam kalan ödeme: <strong>{fmtMoney(allPendingRemaining)}</strong></p>
                    </div>
                </div>
            )}

            {/* Etkinlik türü bazlı özet */}
            {byType.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-black text-gray-800">Etkinlik Türüne Göre Gelir ({year})</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {byType.map(e => (
                            <div key={e.id} className="px-5 py-3 flex items-center gap-3">
                                <span className="text-xl">{e.emoji}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-sm">{e.label}</p>
                                    <p className="text-xs text-gray-400">{e.count} rezervasyon</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-[#B09050] text-sm">{fmtMoney(e.income)}</p>
                                    {e.remaining > 0 && <p className="text-xs text-amber-600">{fmtMoney(e.remaining)} kalan</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Aylık detay */}
            <div>
                <h2 className="font-black text-gray-800 mb-3">Aylık Detay</h2>
                <div className="space-y-3">
                    {monthlyData.map(m => {
                        if (m.res.length === 0 && m.exps.length === 0) return null
                        const isOpen = expandedMonth === m.idx
                        return (
                            <div key={m.idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <button onClick={() => setExpandedMonth(isOpen ? null : m.idx)}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <span className="font-black text-gray-900">{m.month}</span>
                                        <span className="ml-2 text-xs text-gray-400">{m.res.length} çekim</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-gray-400">Ciro: <span className="font-bold text-gray-700">{fmtMoney(m.income)}</span></span>
                                        <span className="text-green-600 font-bold">{fmtMoney(m.deposit)} alındı</span>
                                        {m.expTotal > 0 && <span className="text-red-500 font-bold">-{fmtMoney(m.expTotal)} gider</span>}
                                        <span className={`font-black ${m.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            Net: {fmtMoney(m.profit)}
                                        </span>
                                    </div>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                                </button>

                                {isOpen && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                                        {/* Rezervasyonlar */}
                                        {m.res.map((r: any) => {
                                            const evt = EVENT_TYPES.find(e => e.id === r.eventType)
                                            return (
                                                <div key={r.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                                                    <span>{evt?.emoji || '📷'}</span>
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-gray-800">{r.brideName}{r.groomName ? ` & ${r.groomName}` : ''}</span>
                                                        <span className="text-gray-400 ml-2 text-xs">{r.eventDate}{r.eventTime ? ' · ' + r.eventTime : ''}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-700">{fmtMoney(r.totalAmount || 0)}</p>
                                                        {(r.remainingAmount || 0) > 0 && (
                                                            <p className="text-xs text-amber-600">{fmtMoney(r.remainingAmount)} kalan</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {/* Giderler */}
                                        {m.exps.map((e: any) => (
                                            <div key={e.id} className="px-5 py-3 flex items-center gap-3 text-sm bg-red-50/50">
                                                <span className="text-red-400">💸</span>
                                                <div className="flex-1">
                                                    <span className="text-gray-700">{e.description}</span>
                                                    <span className="text-gray-400 ml-2 text-xs">{e.category}</span>
                                                </div>
                                                <span className="text-red-600 font-bold">-{fmtMoney(e.amount)}</span>
                                                <button onClick={() => deleteExpense(e.id)} className="text-red-300 hover:text-red-500 p-1">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {monthlyData.every(m => m.res.length === 0 && m.exps.length === 0) && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                            <p className="text-3xl mb-3">📭</p>
                            <p className="text-gray-500">{year} yılında kayıt bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gider ekle butonu */}
            <div className="flex justify-end">
                <button onClick={() => setShowExpenseForm(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-red-600 bg-red-50 border border-red-200 hover:bg-red-100">
                    <Plus className="w-4 h-4" /> Gider Ekle
                </button>
            </div>

            {/* Gider formu */}
            {showExpenseForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                    onClick={e => { if (e.target === e.currentTarget) setShowExpenseForm(false) }}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-gray-900">💸 Gider Ekle</h3>
                            <button onClick={() => setShowExpenseForm(false)} className="p-1 text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Açıklama *</label>
                                <input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Lens alımı, araç kirası..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tutar (₺) *</label>
                                    <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tarih *</label>
                                    <input type="date" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Kategori</label>
                                <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]">
                                    {EXPENSE_CATS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowExpenseForm(false)}
                                className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm">Vazgeç</button>
                            <button onClick={saveExpense} disabled={savingExpense}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-sm bg-red-500 hover:bg-red-600 disabled:opacity-50">
                                {savingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
