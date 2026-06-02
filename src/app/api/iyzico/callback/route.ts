import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { checkoutFormRetrieve } from '@/lib/iyzico'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const token = formData.get('token') as string | null

        if (!token) return NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url))

        const result = await checkoutFormRetrieve(token)

        if (!result || result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
            console.error('Iyzico retrieve failed:', result)
            return NextResponse.redirect(new URL('/online-rezervasyon?status=fail', request.url))
        }

        const bookingId = result.basketId
        try {
            await adminDb.collection('bookings').doc(bookingId).update({
                status: 'approved',
                paymentId: result.paymentId,
                paidAt: new Date().toISOString()
            })
        } catch (dbErr) {
            console.error('Firestore update error:', dbErr)
        }

        return NextResponse.redirect(new URL(`/online-rezervasyon?status=success&bookingId=${bookingId}`, request.url))

    } catch (error) {
        console.error('Callback error:', error)
        return NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url))
    }
}
