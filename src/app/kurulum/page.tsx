'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2, Copy, ChevronRight, ChevronLeft,
    Eye, EyeOff, ClipboardPaste, ExternalLink,
    Database, HardDrive, Key, Globe, Sparkles,
    AlertCircle, Check, ArrowRight, UserCircle, Lock
} from 'lucide-react'

const GOLD = '#B09050'
const GOLD_GRAD = 'linear-gradient(135deg, #CAAE78, #B09050)'

// ─── Kopyala butonu ──────────────────────────────────────────────────────────
function CopyBtn({ text, label = 'Kopyala' }: { text: string; label?: string }) {
    const [done, setDone] = useState(false)
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={done
                ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }
                : { background: '#FBF6EC', color: GOLD, border: '1px solid rgba(176,144,80,0.3)' }}>
            {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {done ? 'Kopyalandı!' : label}
        </button>
    )
}

// ─── Dışarıya link butonu ────────────────────────────────────────────────────
function LinkBtn({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 font-bold px-5 py-3 rounded-xl text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundImage: GOLD_GRAD }}>
            {children} <ExternalLink className="w-4 h-4" />
        </a>
    )
}

// ─── Adım kutusu ────────────────────────────────────────────────────────────
function StepBox({ num, label }: { num: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0"
                style={{ backgroundImage: GOLD_GRAD }}>{num}</span>
            <span className="font-bold text-gray-800">{label}</span>
        </div>
    )
}

// ─── Env satırı ──────────────────────────────────────────────────────────────
function EnvRow({ name, value }: { name: string; value: string }) {
    const [show, setShow] = useState(false)
    const isSecret = name.toLowerCase().includes('key') || name.toLowerCase().includes('email') || name.toLowerCase().includes('private')
    return (
        <div className="flex items-start gap-2 py-2.5 border-b border-black/5 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{name}</p>
                <p className="text-xs font-mono break-all text-gray-700 leading-relaxed pr-2">
                    {!value ? <span className="text-gray-300 italic">—</span>
                        : isSecret && !show ? '•'.repeat(Math.min(value.length, 40))
                            : value}
                </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                {isSecret && value && (
                    <button onClick={() => setShow(!show)} className="p-1 text-gray-300 hover:text-gray-500">
                        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                )}
                {value && <CopyBtn text={value} />}
            </div>
        </div>
    )
}

// ─── Ana sayfa ────────────────────────────────────────────────────────────────
export default function KurulumPage() {
    const [step, setStep] = useState(1)
    const TOTAL = 8

    // Form verileri
    const [client, setClient] = useState({ apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' })
    const [admin, setAdmin] = useState({ clientEmail: '', privateKey: '' })
    const [geminiKey, setGeminiKey] = useState('')
    const [pasteText, setPasteText] = useState('')
    const [pasteError, setPasteError] = useState('')
    const [showKey, setShowKey] = useState(false)
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
    const [testMsg, setTestMsg] = useState('')

    // Adım 5 — Admin hesabı oluşturma
    const [adminEmail, setAdminEmail] = useState('')
    const [adminPass, setAdminPass] = useState('')
    const [adminPassConfirm, setAdminPassConfirm] = useState('')
    const [showAdminPass, setShowAdminPass] = useState(false)
    const [createStatus, setCreateStatus] = useState<'idle' | 'creating' | 'ok' | 'error'>('idle')
    const [createMsg, setCreateMsg] = useState('')
    const [createdEmail, setCreatedEmail] = useState('')

    const clientFilled = Object.values(client).every(v => v.trim())
    const adminFilled = admin.clientEmail.trim() && admin.privateKey.trim()

    // Config yapıştır → parse
    const parsePaste = () => {
        setPasteError('')
        try {
            const clean = pasteText
                .replace(/^[\s\S]*?(\{)/, '$1')
                .replace(/\};?\s*$/, '}')
                .replace(/\/\/.*/g, '')
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/(\w+)\s*:/g, '"$1":')
                .replace(/'/g, '"')
            const p = JSON.parse(clean)
            setClient({
                apiKey: p.apiKey || '',
                authDomain: p.authDomain || '',
                projectId: p.projectId || '',
                storageBucket: p.storageBucket || '',
                messagingSenderId: p.messagingSenderId || '',
                appId: p.appId || '',
            })
            setPasteText('')
        } catch {
            setPasteError('Okuyamadım. Firebase konsolundan kopyaladığınız blok mu? Tam yapıştırın.')
        }
    }

    // Admin hesabı oluştur (dinamik Firebase Auth)
    const createAdminUser = async () => {
        if (!adminEmail.trim() || !adminPass.trim()) {
            setCreateStatus('error'); setCreateMsg('E-posta ve şifre zorunludur.')
            return
        }
        if (adminPass !== adminPassConfirm) {
            setCreateStatus('error'); setCreateMsg('Şifreler eşleşmiyor.')
            return
        }
        if (adminPass.length < 6) {
            setCreateStatus('error'); setCreateMsg('Şifre en az 6 karakter olmalıdır.')
            return
        }
        if (!clientFilled) {
            setCreateStatus('error'); setCreateMsg('Önce Firebase bilgilerini (Adım 4) doldurun.')
            return
        }
        setCreateStatus('creating'); setCreateMsg('')
        try {
            const { initializeApp, getApps, deleteApp } = await import('firebase/app')
            const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth')
            const appName = '__setup_create__'
            const ex = getApps().find(a => a.name === appName)
            if (ex) await deleteApp(ex)
            const app = initializeApp({ ...client }, appName)
            const authInst = getAuth(app)
            await createUserWithEmailAndPassword(authInst, adminEmail.trim(), adminPass)
            await deleteApp(app)
            setCreatedEmail(adminEmail.trim())
            setCreateStatus('ok')
            setCreateMsg('Hesap başarıyla oluşturuldu!')
        } catch (e: any) {
            const code = e?.code || ''
            if (code === 'auth/email-already-in-use') {
                setCreateStatus('error'); setCreateMsg('Bu e-posta zaten kayıtlı. Farklı bir e-posta deneyin.')
            } else if (code === 'auth/operation-not-allowed') {
                setCreateStatus('error'); setCreateMsg('Firebase\'de E-posta/Şifre girişi aktif değil. Adım 5\'teki talimatları uygulayın.')
            } else if (code === 'auth/invalid-api-key' || code === 'auth/app-not-authorized') {
                setCreateStatus('error'); setCreateMsg('Firebase API bilgileri hatalı. Adım 4\'e dönüp kontrol edin.')
            } else {
                setCreateStatus('error'); setCreateMsg('Hata: ' + (e?.message || code).slice(0, 100))
            }
        }
    }

    // Bağlantı testi
    const testConnection = async () => {
        setTestStatus('testing'); setTestMsg('')
        try {
            const { initializeApp, getApps, deleteApp } = await import('firebase/app')
            const { getFirestore, doc, getDoc } = await import('firebase/firestore')
            const name = '__setup_test__'
            const ex = getApps().find(a => a.name === name)
            if (ex) await deleteApp(ex)
            const app = initializeApp({ ...client }, name)
            const db = getFirestore(app)
            await getDoc(doc(db, '_test', 'ping'))
            await deleteApp(app)
            setTestStatus('ok'); setTestMsg('Bağlantı başarılı! Firebase proje: ' + client.projectId)
        } catch (e: any) {
            const m = e?.message || ''
            if (m.includes('permission') || m.includes('PERMISSION')) {
                setTestStatus('ok'); setTestMsg('Bağlantı kuruldu! (Firestore kuralları henüz açık değil, normal.)')
            } else if (m.includes('project') || m.includes('not-found')) {
                setTestStatus('error'); setTestMsg('Proje bulunamadı. Project ID\'yi kontrol edin.')
            } else {
                setTestStatus('error'); setTestMsg('Hata: ' + m.slice(0, 100))
            }
        }
    }

    // .env.local içeriği
    const envContent = `NEXT_PUBLIC_FIREBASE_API_KEY=${client.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${client.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${client.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${client.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${client.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${client.appId}
FIREBASE_CLIENT_EMAIL=${admin.clientEmail}
FIREBASE_PRIVATE_KEY="${admin.privateKey}"
GEMINI_API_KEY=${geminiKey}`

    const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}`

    const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`

    return (
        <div className="min-h-screen bg-[#FAF8F4] pb-32 pt-10"
            style={{ fontFamily: "'Sofia Sans', ui-sans-serif, system-ui, sans-serif" }}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400;500;600;700;800&display=swap" />

            <div className="container mx-auto px-4 max-w-xl">

                {/* Başlık */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{ backgroundImage: GOLD_GRAD }}>
                        <Database className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Kurulum Sihirbazı</h1>
                    <p className="text-gray-400 text-sm mt-2">Adım {step} / {TOTAL}</p>
                </div>

                {/* İlerleme çubuğu */}
                <div className="h-1.5 bg-gray-100 rounded-full mb-10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(step / TOTAL) * 100}%`, backgroundImage: GOLD_GRAD }} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}>

                        {/* ════════════════════════════════════════════
                            ADIM 1 — Firebase Hesabı & Proje Oluştur
                        ════════════════════════════════════════════ */}
                        {step === 1 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 1 — Başlangıç</p>
                                    <h2 className="text-2xl font-black">Firebase Hesabı Aç</h2>
                                    <p className="text-gray-500 text-sm mt-1">Firebase, sitenizin veritabanı ve depolama sistemidir. Ücretsizdir.</p>
                                </div>

                                <div className="space-y-4">
                                    <StepBox num="1" label="Aşağıdaki butona tıklayın" />
                                    <div className="ml-10">
                                        <LinkBtn href="https://console.firebase.google.com">Firebase Konsolunu Aç</LinkBtn>
                                    </div>

                                    <StepBox num="2" label={`Google hesabınızla giriş yapın`} />

                                    <StepBox num="3" label={`"Proje oluştur" butonuna tıklayın`} />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
                                        <p>• Projeye bir isim verin (örn: <span className="font-bold">fotografcisite</span>)</p>
                                        <p>• Google Analytics sorarsa "Şimdilik gerek yok" seçin</p>
                                        <p>• <span className="font-bold">"Proje oluştur"</span> butonuna basın</p>
                                        <p>• Proje hazır olunca <span className="font-bold">"Devam"</span> deyin</p>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm"
                                        style={{ backgroundImage: GOLD_GRAD }}>
                                        Projeyi Oluşturdum <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 2 — Firestore Veritabanı
                        ════════════════════════════════════════════ */}
                        {step === 2 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 2 — Veritabanı</p>
                                    <h2 className="text-2xl font-black">Firestore'u Açın</h2>
                                    <p className="text-gray-500 text-sm mt-1">Rezervasyonlarınız, blog yazılarınız ve ayarlarınız burada saklanır.</p>
                                </div>

                                <div className="space-y-4">
                                    <StepBox num="1" label="Firebase konsolunda sol menüde 'Build' (Oluştur) bölümüne bakın" />

                                    <StepBox num="2" label={`"Firestore Database" seçeneğine tıklayın`} />

                                    <StepBox num="3" label={`"Veritabanı oluştur" butonuna tıklayın`} />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
                                        <p>• <span className="font-bold">Test modunda başla</span> seçeneğini seçin</p>
                                        <p>• Bölge olarak <span className="font-bold">europe-west3</span> (Almanya) seçin</p>
                                        <p>• <span className="font-bold">"Bitti"</span> deyin</p>
                                    </div>

                                    <StepBox num="4" label="Kuralları güncelleyin" />
                                    <div className="ml-10 space-y-3">
                                        <p className="text-sm text-gray-600">Firestore açıldıktan sonra <span className="font-bold">Kurallar</span> sekmesine tıklayın. Aşağıdaki kuralı yapıştırıp kaydedin:</p>
                                        <div className="relative">
                                            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono overflow-x-auto text-gray-700 leading-relaxed">{firestoreRules}</pre>
                                            <div className="absolute top-2 right-2">
                                                <CopyBtn text={firestoreRules} label="Kuralı Kopyala" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-between">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                    <button onClick={() => setStep(3)}
                                        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm"
                                        style={{ backgroundImage: GOLD_GRAD }}>
                                        Firestore Hazır <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 3 — Firebase Storage
                        ════════════════════════════════════════════ */}
                        {step === 3 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 3 — Dosya Depolama</p>
                                    <h2 className="text-2xl font-black">Storage'ı Açın</h2>
                                    <p className="text-gray-500 text-sm mt-1">Fotoğraflarınız ve logonuz burada depolanır.</p>
                                </div>

                                <div className="space-y-4">
                                    <StepBox num="1" label="Sol menüde 'Storage' seçeneğine tıklayın" />

                                    <StepBox num="2" label={`"Başlayın" butonuna tıklayın`} />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
                                        <p>• <span className="font-bold">Test modunda başla</span> seçin</p>
                                        <p>• Bölge olarak <span className="font-bold">europe-west3</span> seçin</p>
                                        <p>• <span className="font-bold">"Bitti"</span> deyin</p>
                                    </div>

                                    <StepBox num="3" label="Kuralları güncelleyin" />
                                    <div className="ml-10 space-y-3">
                                        <p className="text-sm text-gray-600">Storage açıldıktan sonra <span className="font-bold">Kurallar</span> sekmesine tıklayın. Aşağıdaki kuralı yapıştırıp kaydedin:</p>
                                        <div className="relative">
                                            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono overflow-x-auto text-gray-700 leading-relaxed">{storageRules}</pre>
                                            <div className="absolute top-2 right-2">
                                                <CopyBtn text={storageRules} label="Kuralı Kopyala" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-between">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                    <button onClick={() => setStep(4)}
                                        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm"
                                        style={{ backgroundImage: GOLD_GRAD }}>
                                        Storage Hazır <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 4 — Web App Bilgileri
                        ════════════════════════════════════════════ */}
                        {step === 4 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 4 — Bağlantı Bilgileri</p>
                                    <h2 className="text-2xl font-black">Web App Kodunu Alın</h2>
                                    <p className="text-gray-500 text-sm mt-1">Sitenin Firebase'e bağlanması için bu bilgiler gerekiyor.</p>
                                </div>

                                <div className="space-y-3">
                                    <StepBox num="1" label="⚙️ Proje Ayarları'na gidin" />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
                                        Firebase konsolunda sol üstteki <span className="font-bold">⚙️ dişli ikonuna</span> tıklayın → <span className="font-bold">"Proje Ayarları"</span>
                                    </div>

                                    <StepBox num="2" label="Web uygulaması ekleyin" />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
                                        <p>• <span className="font-bold">"Uygulamalarınız"</span> bölümünde <span className="font-bold">&lt;/&gt; Web</span> ikonuna tıklayın</p>
                                        <p>• Uygulama takma adı girin (örn: <span className="font-bold">web</span>)</p>
                                        <p>• <span className="font-bold">"Uygulamayı kaydet"</span> deyin</p>
                                    </div>

                                    <StepBox num="3" label="Açılan firebaseConfig bloğunu kopyalayın ve aşağıya yapıştırın" />
                                    <div className="ml-10 space-y-3">
                                        <textarea rows={5} value={pasteText} onChange={e => setPasteText(e.target.value)}
                                            className="w-full font-mono text-xs border border-gray-200 rounded-2xl p-4 outline-none focus:border-[#CAAE78] resize-none"
                                            placeholder={'const firebaseConfig = {\n  apiKey: "AIza...",\n  authDomain: "proje.firebaseapp.com",\n  ...\n};'} />
                                        {pasteError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{pasteError}</p>}
                                        <button onClick={parsePaste}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                                            style={{ backgroundImage: GOLD_GRAD }}>
                                            <ClipboardPaste className="w-4 h-4" /> Otomatik Doldur
                                        </button>
                                    </div>

                                    {/* Dolu ise özet göster */}
                                    {clientFilled && (
                                        <div className="ml-10 p-4 rounded-2xl border text-sm space-y-1"
                                            style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                                            <p className="font-bold text-green-700 flex items-center gap-1.5 mb-2">
                                                <CheckCircle2 className="w-4 h-4" /> Bilgiler alındı!
                                            </p>
                                            <p className="text-green-600 text-xs">Proje: <span className="font-mono font-bold">{client.projectId}</span></p>
                                            <p className="text-green-600 text-xs">Storage: <span className="font-mono font-bold">{client.storageBucket}</span></p>
                                        </div>
                                    )}

                                    {/* Manuel giriş */}
                                    {!clientFilled && (
                                        <details className="ml-10">
                                            <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 font-semibold">Manuel girmek istiyorum →</summary>
                                            <div className="mt-3 space-y-3">
                                                {[
                                                    { key: 'apiKey', label: 'apiKey', ph: 'AIzaSy...' },
                                                    { key: 'authDomain', label: 'authDomain', ph: 'proje.firebaseapp.com' },
                                                    { key: 'projectId', label: 'projectId', ph: 'proje-id' },
                                                    { key: 'storageBucket', label: 'storageBucket', ph: 'proje.appspot.com' },
                                                    { key: 'messagingSenderId', label: 'messagingSenderId', ph: '123456' },
                                                    { key: 'appId', label: 'appId', ph: '1:...:web:...' },
                                                ].map(f => (
                                                    <div key={f.key}>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
                                                        <input value={client[f.key as keyof typeof client]}
                                                            onChange={e => setClient({ ...client, [f.key]: e.target.value })}
                                                            placeholder={f.ph}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-[#CAAE78]" />
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>

                                {/* Bağlantı testi */}
                                {clientFilled && (
                                    <div>
                                        <button onClick={testConnection} disabled={testStatus === 'testing'}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                                            style={{ background: 'white', borderColor: '#e5e7eb', color: '#374151' }}>
                                            {testStatus === 'testing'
                                                ? <><span className="w-4 h-4 border-2 border-[#B09050] border-t-transparent rounded-full animate-spin" />Test ediliyor...</>
                                                : <><CheckCircle2 className="w-4 h-4" />Bağlantıyı Test Et</>}
                                        </button>
                                        {testStatus !== 'idle' && testStatus !== 'testing' && (
                                            <p className={`text-xs mt-2 flex items-center gap-1.5 ${testStatus === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                                                {testStatus === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                {testMsg}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2 flex justify-between">
                                    <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                    <button onClick={() => setStep(5)} disabled={!clientFilled}
                                        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm disabled:opacity-40"
                                        style={{ backgroundImage: GOLD_GRAD }}>
                                        Devam Et <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 5 — Admin Hesabı Oluştur
                        ════════════════════════════════════════════ */}
                        {step === 5 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 5 — Giriş Bilgileri</p>
                                    <h2 className="text-2xl font-black">Admin Hesabınızı Oluşturun</h2>
                                    <p className="text-gray-500 text-sm mt-1">Bu bilgilerle admin paneline giriş yapacaksınız. İstediğiniz zaman değiştirebilirsiniz.</p>
                                </div>

                                {/* Önce Authentication'ı aç */}
                                <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FBF6EC', border: '1px solid rgba(176,144,80,0.2)' }}>
                                    <p className="font-bold text-sm" style={{ color: GOLD }}>⚠️ Önce Firebase\'de E-posta Girişini Açın</p>
                                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside leading-relaxed">
                                        <li>Firebase konsolunda sol menüden <strong>Authentication</strong>'a tıklayın</li>
                                        <li><strong>"Başlayın"</strong> butonuna tıklayın</li>
                                        <li><strong>"E-posta/Şifre"</strong> satırına tıklayın → <strong>Etkinleştir</strong> → <strong>Kaydet</strong></li>
                                    </ol>
                                    <a href="https://console.firebase.google.com" target="_blank" rel="noopener"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold underline" style={{ color: GOLD }}>
                                        Firebase Konsolunu Aç <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {createStatus === 'ok' ? (
                                    /* ── BAŞARILI ── */
                                    <div className="space-y-4">
                                        <div className="rounded-2xl p-5 bg-green-50 border border-green-200 space-y-3">
                                            <p className="font-black text-green-700 flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" /> Hesap Oluşturuldu!
                                            </p>
                                            <div className="bg-white rounded-xl p-4 space-y-2 border border-green-100">
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Giriş Bilgileriniz</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">E-posta</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-sm">{createdEmail}</span>
                                                        <CopyBtn text={createdEmail} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Şifre</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-sm">{adminPass}</span>
                                                        <CopyBtn text={adminPass} />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-green-600">
                                                💡 Bu bilgileri bir yere not alın. Admin paneline girdikten sonra <strong>Ayarlar → Şifre Değiştir</strong>'den güncelleyebilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── FORM ── */
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                                                <UserCircle className="w-3.5 h-3.5 inline mr-1" />E-posta Adresi
                                            </label>
                                            <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                                                placeholder="admin@fotografcim.com"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#CAAE78]" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                                                <Lock className="w-3.5 h-3.5 inline mr-1" />Şifre <span className="font-normal text-gray-400">(min. 6 karakter)</span>
                                            </label>
                                            <div className="relative">
                                                <input type={showAdminPass ? 'text' : 'password'} value={adminPass}
                                                    onChange={e => setAdminPass(e.target.value)}
                                                    placeholder="En az 6 karakter"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm font-mono outline-none focus:border-[#CAAE78]" />
                                                <button type="button" onClick={() => setShowAdminPass(!showAdminPass)}
                                                    className="absolute right-4 top-3 text-gray-300 hover:text-gray-500">
                                                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                                                <Lock className="w-3.5 h-3.5 inline mr-1" />Şifre Tekrar
                                            </label>
                                            <input type={showAdminPass ? 'text' : 'password'} value={adminPassConfirm}
                                                onChange={e => setAdminPassConfirm(e.target.value)}
                                                placeholder="Şifreyi tekrar yazın"
                                                className={`w-full bg-gray-50 border rounded-2xl px-4 py-3 text-sm font-mono outline-none transition-colors ${
                                                    adminPassConfirm && adminPass !== adminPassConfirm
                                                        ? 'border-red-300 focus:border-red-400'
                                                        : adminPassConfirm && adminPass === adminPassConfirm
                                                        ? 'border-green-300 focus:border-green-400'
                                                        : 'border-gray-200 focus:border-[#CAAE78]'
                                                }`} />
                                            {adminPassConfirm && adminPass !== adminPassConfirm && (
                                                <p className="text-red-500 text-xs mt-1 ml-1">Şifreler eşleşmiyor</p>
                                            )}
                                        </div>

                                        {createStatus === 'error' && (
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-red-600 text-sm">{createMsg}</p>
                                            </div>
                                        )}

                                        <button onClick={createAdminUser}
                                            disabled={createStatus === 'creating' || !adminEmail || !adminPass || adminPass !== adminPassConfirm}
                                            className="w-full py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                                            style={{ backgroundImage: GOLD_GRAD }}>
                                            {createStatus === 'creating'
                                                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Hesap Oluşturuluyor...</>
                                                : <><UserCircle className="w-4 h-4" /> Admin Hesabı Oluştur</>}
                                        </button>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-between">
                                    <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                    <button onClick={() => setStep(6)} disabled={createStatus !== 'ok'}
                                        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm disabled:opacity-40"
                                        style={{ backgroundImage: GOLD_GRAD }}>
                                        Devam Et <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 5 — Admin Yetkisi
                        ════════════════════════════════════════════ */}
                        {step === 5 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 5 — Sunucu Yetkisi</p>
                                    <h2 className="text-2xl font-black">Admin Anahtarını Alın</h2>
                                    <p className="text-gray-500 text-sm mt-1">Rezervasyon kaydetme gibi işlemler için sunucu tarafı yetkisi gerekiyor.</p>
                                </div>

                                <div className="space-y-4">
                                    <StepBox num="1" label="⚙️ Proje Ayarları → Hizmet Hesapları" />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
                                        Firebase konsolunda <span className="font-bold">⚙️ Proje Ayarları</span>'na gidin, üst menüden <span className="font-bold">"Hizmet hesapları"</span> sekmesine tıklayın.
                                    </div>

                                    <StepBox num="2" label='"Yeni özel anahtar oluştur" butonuna tıklayın' />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
                                        Açılan pencerede <span className="font-bold">"Anahtar oluştur"</span> deyin. Bilgisayarınıza bir <span className="font-bold">.json dosyası</span> inecek.
                                    </div>

                                    <StepBox num="3" label="İndirilen JSON dosyasını açın" />
                                    <div className="ml-10 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                                        📂 İndirilen dosyayı Not Defteri veya benzeri bir metin editörüyle açın. İçinde şunları göreceksiniz:
                                        <div className="mt-2 font-mono text-xs bg-white rounded-lg p-3 border border-amber-200 text-gray-700 space-y-0.5">
                                            <p>{`{`}</p>
                                            <p className="ml-4 text-gray-400">...</p>
                                            <p className="ml-4"><span className="text-blue-600">"client_email"</span>: <span className="text-green-600">"firebase-adminsdk-xxx@proje.iam..."</span>,</p>
                                            <p className="ml-4"><span className="text-blue-600">"private_key"</span>: <span className="text-green-600">"-----BEGIN PRIVATE KEY-----\nMIIEv..."</span></p>
                                            <p className="ml-4 text-gray-400">...</p>
                                            <p>{`}`}</p>
                                        </div>
                                    </div>

                                    <StepBox num="4" label="Bu iki değeri aşağıya kopyalayın" />
                                    <div className="ml-10 space-y-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">client_email değeri</label>
                                            <input value={admin.clientEmail} onChange={e => setAdmin({ ...admin, clientEmail: e.target.value })}
                                                placeholder='firebase-adminsdk-xxxxx@proje-id.iam.gserviceaccount.com'
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-[#CAAE78]" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">private_key değeri <span className="text-gray-400 font-normal">(tırnak işaretleri dahil uzun metin)</span></label>
                                            <div className="relative">
                                                <textarea rows={3} value={admin.privateKey} onChange={e => setAdmin({ ...admin, privateKey: e.target.value })}
                                                    placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvg...&#10;-----END PRIVATE KEY-----"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-[#CAAE78] resize-none"
                                                    style={{ filter: showKey ? 'none' : 'blur(2px)' }} />
                                                <button type="button" onClick={() => setShowKey(!showKey)}
                                                    className="absolute right-3 top-3 text-gray-300 hover:text-gray-500">
                                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-between">
                                    <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                    <button onClick={() => setStep(6)} disabled={!adminFilled}
                                        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm disabled:opacity-40"
                                        style={{ backgroundImage: GOLD_GRAD }}>
                                        Devam Et <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 6 — Gemini API
                        ════════════════════════════════════════════ */}
                        {step === 6 && (
                            <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 6 — Yapay Zeka (İsteğe Bağlı)</p>
                                    <h2 className="text-2xl font-black">Gemini API Anahtarı</h2>
                                    <p className="text-gray-500 text-sm mt-1">Bu adımı atlayabilirsiniz. Sadece blog yazısı üretmek istiyorsanız gereklidir. Ücretsizdir.</p>
                                </div>

                                <div className="space-y-4">
                                    <StepBox num="1" label="Aşağıdaki butona tıklayın" />
                                    <div className="ml-10">
                                        <LinkBtn href="https://aistudio.google.com/app/apikey">Google AI Studio'yu Aç</LinkBtn>
                                    </div>

                                    <StepBox num="2" label='"Create API Key" butonuna tıklayın' />
                                    <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
                                        <p>• Açılan listeden az önce oluşturduğunuz <span className="font-bold">Firebase projesini</span> seçin</p>
                                        <p>• <span className="font-bold">"Create API key in existing project"</span> deyin</p>
                                        <p>• Üretilen anahtarı kopyalayın</p>
                                    </div>

                                    <StepBox num="3" label="Anahtarı buraya yapıştırın" />
                                    <div className="ml-10 relative">
                                        <input type={showKey ? 'text' : 'password'} value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm font-mono outline-none focus:border-[#CAAE78]" />
                                        <button type="button" onClick={() => setShowKey(!showKey)}
                                            className="absolute right-3 top-3 text-gray-300 hover:text-gray-500">
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
                                    <strong>Bu adımı atlarsanız</strong> ne olur? Siteniz çalışmaya devam eder. Sadece admin panelindeki <strong>Blog Yazıları → AI ile Yaz</strong> özelliği çalışmaz.
                                </div>

                                <div className="pt-2 flex justify-between">
                                    <button onClick={() => setStep(5)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(7)}
                                            className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200">
                                            Bu Adımı Atla
                                        </button>
                                        <button onClick={() => setStep(7)}
                                            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm"
                                            style={{ backgroundImage: GOLD_GRAD }}>
                                            {geminiKey ? 'Devam Et' : 'Atla'} <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════
                            ADIM 7 — Vercel'e Ekle
                        ════════════════════════════════════════════ */}
                        {step === 7 && (
                            <div className="space-y-5">
                                <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-6">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GOLD }}>Adım 7 — Son Adım!</p>
                                        <h2 className="text-2xl font-black">Vercel'e Ekleyin</h2>
                                        <p className="text-gray-500 text-sm mt-1">Bu değerleri Vercel'deki projenize ekleyin. Sonra siteniz hazır!</p>
                                    </div>

                                    <div className="space-y-4">
                                        <StepBox num="1" label="Vercel'e gidin ve projenizi açın" />
                                        <div className="ml-10">
                                            <LinkBtn href="https://vercel.com/dashboard">Vercel Dashboard'u Aç</LinkBtn>
                                        </div>

                                        <StepBox num="2" label="Settings → Environment Variables" />
                                        <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
                                            Projenizin üst menüsünden <span className="font-bold">Settings</span>'e, ardından <span className="font-bold">Environment Variables</span> sekmesine tıklayın.
                                        </div>

                                        <StepBox num="3" label="Aşağıdaki değerleri tek tek ekleyin" />
                                        <div className="ml-10 space-y-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-bold text-gray-500">Her değer için: Name alanına sol kolon, Value alanına sağ kolondaki değeri yazın → Save</p>
                                                <CopyBtn text={envContent} label="Tümünü Kopyala" />
                                            </div>
                                            <div className="border border-gray-100 rounded-2xl divide-y divide-gray-50 bg-white">
                                                <EnvRow name="NEXT_PUBLIC_FIREBASE_API_KEY" value={client.apiKey} />
                                                <EnvRow name="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" value={client.authDomain} />
                                                <EnvRow name="NEXT_PUBLIC_FIREBASE_PROJECT_ID" value={client.projectId} />
                                                <EnvRow name="NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" value={client.storageBucket} />
                                                <EnvRow name="NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" value={client.messagingSenderId} />
                                                <EnvRow name="NEXT_PUBLIC_FIREBASE_APP_ID" value={client.appId} />
                                                <EnvRow name="FIREBASE_CLIENT_EMAIL" value={admin.clientEmail} />
                                                <EnvRow name="FIREBASE_PRIVATE_KEY" value={admin.privateKey} />
                                                {geminiKey && <EnvRow name="GEMINI_API_KEY" value={geminiKey} />}
                                            </div>
                                        </div>

                                        <StepBox num="4" label="Projeyi yeniden yayınlayın (Redeploy)" />
                                        <div className="ml-10 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
                                            Vercel'de <span className="font-bold">Deployments</span> sekmesine gidin, son deployment'ın yanındaki <span className="font-bold">⋯ → Redeploy</span>'a tıklayın.
                                        </div>
                                    </div>
                                </div>

                                {/* Admin hesabı oluşturma */}
                                <div className="bg-white rounded-3xl border border-black/5 p-7 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 font-black text-gray-900 text-lg">
                                        <Key className="w-5 h-5" style={{ color: GOLD }} />
                                        Son Olarak: Admin Hesabı Oluşturun
                                    </div>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-start gap-3">
                                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                                            <p>Firebase Konsolu → <strong>Authentication</strong> → Sol menüden <strong>"Users"</strong></p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                                            <p><strong>"Add user"</strong> butonuna tıklayın — e-posta ve şifre girin. Bu sizin admin girişiniz.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                                            <p>Redeploy bittikten sonra sitenize gidin → <strong>/admin</strong> adresinden giriş yapın.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                                            <p>Admin panelinde <strong>Ayarlar → Site Bilgileri</strong>'nden ismizi, telefonunuzu ve logonuzu girin.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tebrikler */}
                                <div className="rounded-3xl p-7 text-center text-white space-y-3" style={{ backgroundImage: GOLD_GRAD }}>
                                    <div className="text-4xl">🎉</div>
                                    <h3 className="text-xl font-black">Kurulum Tamamlandı!</h3>
                                    <p className="text-white/80 text-sm">Redeploy bittikten sonra siteniz yayında olacak.</p>
                                    <a href="/admin"
                                        className="inline-flex items-center gap-2 bg-white font-black px-7 py-3 rounded-2xl text-sm mt-2"
                                        style={{ color: GOLD }}>
                                        Admin Paneline Git <ChevronRight className="w-4 h-4" />
                                    </a>
                                </div>

                                <div className="flex justify-start">
                                    <button onClick={() => setStep(6)} className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200">
                                        <ChevronLeft className="w-4 h-4" /> Geri
                                    </button>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
