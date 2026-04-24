import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
const Iyzipay = require('iyzipay')

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const token = formData.get('token')

        if (!token) return NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url))

        // iyzico ödeme sonucunu sorgula
        return new Promise<NextResponse>((resolve) => {
            iyzipay.checkoutForm.retrieve({
                locale: Iyzipay.LOCALE.TR,
                conversationId: '', // Opsiyonel
                token: token
            }, async (err: any, result: any) => {
                if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                    // Ödeme başarılı! Firestore'daki rezervasyonu güncelle
                    const bookingId = result.basketId
                    await updateDoc(doc(db, 'bookings', bookingId), {
                        status: 'approved',
                        paymentId: result.paymentId,
                        paidAt: new Date().toISOString()
                    })

                    resolve(NextResponse.redirect(new URL(`/online-rezervasyon?status=success&bookingId=${bookingId}`, request.url)))
                } else {
                    // Ödeme başarısız
                    resolve(NextResponse.redirect(new URL('/online-rezervasyon?status=fail', request.url)))
                }
            })
        })

    } catch (error) {
        return NextResponse.redirect(new URL('/online-rezervasyon?status=error', request.url))
    }
}
