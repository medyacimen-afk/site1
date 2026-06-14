import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin route koruması.
// Edge runtime'da firebase-admin çalışmadığı için burada yalnızca session
// cookie'sinin VARLIĞINI kontrol ederiz (hafif kapı). Cookie'nin geçerliliği
// ayrıca sunucu tarafında (auth-server.ts / verifyAdmin) ve Firestore
// güvenlik kurallarıyla doğrulanır.
export function proxy(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    const { pathname } = request.nextUrl

    // Admin rotalarını koru: Session çerezi yoksa Giriş sayfasına yönlendir
    if (pathname.startsWith('/admin')) {
        if (!session) {
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Halihazırda giriş yapmış bir admin /login sayfasına giderse Dashboard'a at
    if (pathname.startsWith('/login')) {
        if (session) {
            const url = new URL('/admin', request.url)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    // Sadece /admin ve /login rotalarını kontrol et
    matcher: ['/admin/:path*', '/login'],
}
