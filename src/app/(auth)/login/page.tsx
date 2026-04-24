"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { motion } from 'framer-motion'
import { Lock, Mail, Loader2, Aperture } from 'lucide-react'
import { setCookie } from 'cookies-next'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            
            // UID Whitelist Control
            const allowedUids = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '').split(',')
            if (!allowedUids.includes(user.uid)) {
                throw new Error('auth/unauthorized-user')
            }

            const token = await user.getIdToken()
            
            // Firebase token'ını API rotasına gönderip session cookie'si oluşturacağız
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, uid: user.uid })
            })

            if (response.ok) {
                // Alternatif olarak istemci tarafında da bir işaret bırakabiliriz
                setCookie('isLoggedIn', 'true', { maxAge: 60 * 60 * 24 * 7 }) 
                router.push('/admin')
                router.refresh()
            } else {
                setError('Oturum oluşturulurken bir hata oluştu.')
            }
        } catch (err: any) {
            console.error(err)
            if (err.code === 'auth/invalid-credential') {
                setError('E-posta veya şifre hatalı.')
            } else if (err.message === 'auth/unauthorized-user') {
                setError('Yetkisiz giriş denemesi. Bu hesap admin yetkisine sahip değil.')
            } else {
                setError('Giriş yapılırken bir hata oluştu.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#121212] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl"
            >
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-[#D49A73] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[#D49A73]/20">
                        <Aperture className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Girişi</h1>
                    <p className="text-white/50 text-sm">Yönetici paneline erişmek için bilgilerinizi girin.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1 tracking-widest">E-posta</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D49A73] transition-colors"
                                placeholder="admin@sivasdugun.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1 tracking-widest">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D49A73] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#D49A73] hover:bg-white text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Giriş Yap
                                <motion.span 
                                    className="block group-hover:translate-x-1 transition-transform"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button className="text-white/30 text-xs hover:text-white transition-colors">Şifremi Unuttum</button>
                </div>
            </motion.div>
        </div>
    )
}
