import { cookies } from 'next/headers'
import { adminDb } from './firebase-admin'
import { createHash } from 'crypto'

const COOKIE_NAME = 'admin_session'

function makeToken(username: string, password: string): string {
    const secret = process.env.ADMIN_SESSION_SECRET || 'fotografci-gizli-anahtar-2024'
    return createHash('sha256').update(`${username}:${password}:${secret}`).digest('hex')
}

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
    } catch { /* sessiz geç */ }
    return { username: 'admin', password: '123456' }
}

/**
 * Admin session cookie'sini doğrular.
 * Geçerliyse { username } döner, değilse null.
 */
export async function verifyAdmin(): Promise<{ uid: string } | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(COOKIE_NAME)?.value
        if (!token) return null

        const creds = await getAdminCredentials()
        const expected = makeToken(creds.username, creds.password)

        if (token !== expected) return null

        return { uid: creds.username }
    } catch {
        return null
    }
}
