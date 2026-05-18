import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // Iyzipay'i function icinde lazy load et — modul-level crash olursa
        // tum route HTML 500 doner, JSON gelmez. Boylece her durumda JSON donebilir.
        let Iyzipay: any
        try {
            Iyzipay = require('iyzipay')
        } catch (loadErr: any) {
            console.error('Iyzipay module load failed:', loadErr)
            return NextResponse.json({
                error: 'Iyzipay paketi yuklenemedi',
                detail: loadErr?.message || String(loadErr),
                code: loadErr?.code
            }, { status: 500 })
        }

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

        const iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY,
            secretKey: process.env.IYZICO_SECRET_KEY,
            uri: process.env.IYZICO_BASE_URL
        })

        const body = await request.json()
        const { amount, bookingId, user, items } = body

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
                gsmNumber: (user.phone || '').replace(/\s/g, ''),
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
                id: String(item.id),
                name: item.title,
                category1: 'Photography',
                category2: 'Wedding',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: Number(item.price).toFixed(2)
            }))
        }

        return new Promise<NextResponse>((resolve) => {
            try {
                iyzipay.checkoutFormInitialize.create(data, (err: any, result: any) => {
                    if (err) {
                        console.error('Iyzico create error:', err)
                        resolve(NextResponse.json({
                            error: err?.message || err?.errorMessage || 'Iyzico API Error',
                            detail: err
                        }, { status: 500 }))
                    } else {
                        resolve(NextResponse.json(result))
                    }
                })
            } catch (innerErr: any) {
                console.error('Iyzico create threw:', innerErr)
                resolve(NextResponse.json({
                    error: 'Iyzico create() icinden hata firlattı',
                    detail: innerErr?.message || String(innerErr)
                }, { status: 500 }))
            }
        })

    } catch (error: any) {
        console.error('Payment API Exception:', error)
        return NextResponse.json({
            error: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 })
    }
}
