import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
const Iyzipay = require('iyzipay')

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const token = formData.get('token') as string | null

        if (!token) return NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url))

        return new Promise<NextResponse>((resolve) => {
            iyzipay.checkoutForm.retrieve({
                locale: Iyzipay.LOCALE.TR,
                conversationId: '',
                token: token
            }, async (err: any, result: any) => {
                if (err || !result) {
                    console.error('Iyzico retrieve error:', err)
                    resolve(NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url)))
                    return
                }

                if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
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
                    resolve(NextResponse.redirect(new URL(`/online-rezervasyon?status=success&bookingId=${bookingId}`, request.url)))
                } else {
                    resolve(NextResponse.redirect(new URL('/online-rezervasyon?status=fail', request.url)))
                }
            })
        })

    } catch (error) {
        console.error('Callback error:', error)
        return NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url))
    }
}
