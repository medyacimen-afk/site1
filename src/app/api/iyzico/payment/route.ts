import { NextResponse } from 'next/server'
import { checkoutFormInitialize, IYZICO_BASKET_ITEM_VIRTUAL } from '@/lib/iyzico'

export async function POST(request: Request) {
    try {
        if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY || !process.env.IYZICO_BASE_URL) {
            return NextResponse.json({
                error: 'Iyzico ortam degiskenleri eksik',
                missing: {
                    apiKey: !process.env.IYZICO_API_KEY,
                    secretKey: !process.env.IYZICO_SECRET_KEY,
                    baseUrl: !process.env.IYZICO_BASE_URL
                }
            }, { status: 500 })
        }

        const body = await request.json()
        const { amount, bookingId, user, items } = body

        const formattedPrice = Number(amount).toFixed(2)

        // Gerçek adres / kimlik bilgisini kullan (yoksa güvenli varsayılan)
        const tc = String(user?.tcNo || '').replace(/\D/g, '')
        const identityNumber = tc.length === 11 ? tc : '11111111111'
        const realAddress = (user?.address && String(user.address).trim()) || 'Sivas Merkez'
        const contactFullName = `${user?.brideName || 'Gelin'}${user?.groomName ? ' & ' + user.groomName : ''}`

        const result = await checkoutFormInitialize({
            conversationId: bookingId,
            price: formattedPrice,
            paidPrice: formattedPrice,
            basketId: bookingId,
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/iyzico/callback`,
            enabledInstallments: [1, 2, 3, 6, 9],
            buyer: {
                id: `USER-${Date.now()}`,
                name: user.brideName || 'Gelin',
                surname: user.groomName || 'Damat',
                gsmNumber: (user.phone || '').replace(/\s/g, ''),
                email: user.email || 'bilgi@fotografci.com',
                identityNumber: identityNumber,
                lastLoginDate: '2023-10-05 12:43:35',
                registrationDate: '2023-04-21 15:12:09',
                registrationAddress: realAddress,
                ip: '85.34.78.112',
                city: 'Sivas',
                country: 'Turkey',
                zipCode: '58000'
            },
            shippingAddress: {
                contactName: contactFullName,
                city: 'Sivas',
                country: 'Turkey',
                address: realAddress,
                zipCode: '58000'
            },
            billingAddress: {
                contactName: contactFullName,
                city: 'Sivas',
                country: 'Turkey',
                address: realAddress,
                zipCode: '58000'
            },
            basketItems: items.map((item: any) => ({
                id: String(item.id),
                name: item.title,
                category1: 'Photography',
                category2: 'Wedding',
                itemType: IYZICO_BASKET_ITEM_VIRTUAL,
                price: Number(item.price).toFixed(2)
            }))
        })

        if (result?.status !== 'success') {
            console.error('Iyzico initialize error:', result)
            return NextResponse.json({
                error: result?.errorMessage || 'Iyzico API Error',
                detail: result
            }, { status: 500 })
        }

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Payment API Exception:', error)
        return NextResponse.json({
            error: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 })
    }
}
