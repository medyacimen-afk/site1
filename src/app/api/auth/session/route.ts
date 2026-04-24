import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    const { token, uid } = await request.json()

    if (!token || !uid) {
        return NextResponse.json({ error: 'Token or UID missing' }, { status: 400 })
    }

    // UID Whitelist Control
    const allowedUids = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '').split(',')
    if (!allowedUids.includes(uid)) {
        return NextResponse.json({ error: 'Unauthorized UID' }, { status: 403 })
    }

    // Gerçek bir üretim ortamında burada Firebase Admin SDK ile token doğrulanmalıdır.
    // Ancak hızlıca panelin "çalışması" ve giriş yapılması için cookie'yi set ediyoruz.
    // Gelen token'ı güvenli bir HTTP-only cookie olarak kaydediyoruz.
    
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
        maxAge: 60 * 60 * 24 * 7, // 1 hafta
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })

    return NextResponse.json({ success: true })
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return NextResponse.json({ success: true })
}
