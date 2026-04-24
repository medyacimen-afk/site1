import { NextResponse } from 'next/server'
const Iyzipay = require('iyzipay')

// Bu bilgiler .env.local dosyasından alınmalıdır.
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || 'sandbox-key',
    secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret',
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { amount, bookingId, user, items } = body

        // Fiyatı iyzico'nun istediği formatta (string ve . ile ayrılmış) alalım
        const formattedPrice = Number(amount).toFixed(2)

        const data = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: bookingId,
            price: formattedPrice,
            paidPrice: formattedPrice,
            currency: Iyzipay.CURRENCY.TL,
            basketId: bookingId,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/iyzico/callback`,
            enabledInstallments: [1, 2, 3, 6, 9],
            buyer: {
                id: `USER-${Date.now()}`,
                name: user.brideName || 'Gelin',
                surname: user.groomName || 'Damat',
                gsmNumber: user.phone.replace(/\s/g, ''),
                email: user.email || 'bilgi@sivasdugunfotografcisi.com',
                identityNumber: '11111111111',
                lastLoginDate: '2023-10-05 12:43:35',
                registrationDate: '2023-04-21 15:12:09',
                registrationAddress: 'Sivas Merkez',
                ip: '85.34.78.112',
                city: 'Sivas',
                country: 'Turkey',
                zipCode: '58000'
            },
            shippingAddress: {
                contactName: `${user.brideName} & ${user.groomName}`,
                city: 'Sivas',
                country: 'Turkey',
                address: 'Online Rezervasyon',
                zipCode: '58000'
            },
            billingAddress: {
                contactName: `${user.brideName} & ${user.groomName}`,
                city: 'Sivas',
                country: 'Turkey',
                address: 'Online Rezervasyon',
                zipCode: '58000'
            },
            basketItems: items.map((item: any) => ({
                id: item.id,
                name: item.title,
                category1: 'Photography',
                category2: 'Wedding',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: Number(item.price).toFixed(2)
            }))
        }

        return new Promise<NextResponse>((resolve) => {
            iyzipay.checkoutFormInitialize.create(data, (err: any, result: any) => {
                if (err) {
                    console.error('Iyzico Error:', err)
                    resolve(NextResponse.json({ error: err }, { status: 500 }))
                } else {
                    resolve(NextResponse.json(result))
                }
            })
        })

    } catch (error: any) {
        console.error('Payment API Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
