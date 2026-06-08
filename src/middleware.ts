import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin route koruması.
// Edge runtime'da firebase-admin çalışmadığı için burada yalnızca session
// cookie'sinin VARLIĞINI kontrol ederiz (hafif kapı). Cookie'nin geçerliliği
// ayrıca sunucu tarafında (auth-server.ts / verifyAdmin) ve Firestore
// güvenlik kurallarıyla doğrulanır.
export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    if (!session) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    // Sadece /admin ve alt yollarını koru
    matcher: ['/admin/:path*'],
}
