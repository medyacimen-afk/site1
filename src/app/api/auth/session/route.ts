import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb } from '@/lib/firebase-admin'
import { createHash } from 'crypto'

const COOKIE_NAME = 'admin_session'
const EXPIRES_IN_SEC = 60 * 60 * 24 * 7 // 1 hafta

// Cookie token üret: sha256(kullaniciAdi:sifre:secret)
function makeToken(username: string, password: string): string {
    const secret = process.env.ADMIN_SESSION_SECRET || 'fotografci-gizli-anahtar-2024'
    return createHash('sha256').update(`${username}:${password}:${secret}`).digest('hex')
}

// Firestore'dan admin kimlik bilgilerini oku (yoksa varsayılan)
async function getAdminCredentials(): Promise<{ username: string; password: string }> {
    try {
        if (!adminDb) return { username: 'admin', password: '123456' }
        const snap = await adminDb.collection('settings').doc('auth').get()
        if (snap.exists) {
            const data = snap.data()!
            return {
                username: data.username || 'admin',
                password: data.password || '123456',
            }
        }
    } catch { /* Firestore henüz hazır değilse varsayılan döner */ }
    return { username: 'admin', password: '123456' }
}

// POST → giriş
export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 })
        }

        const creds = await getAdminCredentials()

        if (username.trim() !== creds.username || password !== creds.password) {
            return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 })
        }

        const token = makeToken(creds.username, creds.password)

        const cookieStore = await cookies()
        cookieStore.set(COOKIE_NAME, token, {
            maxAge: EXPIRES_IN_SEC,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Giriş hatası:', error)
        return NextResponse.json({ error: 'Giriş yapılamadı' }, { status: 500 })
    }
}

// DELETE → çıkış
export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
    return NextResponse.json({ success: true })
}
