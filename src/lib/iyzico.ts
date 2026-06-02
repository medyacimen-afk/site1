import crypto from 'crypto'

// Iyzico REST istemcisi — iyzipay npm paketine bagimli DEGIL.
// Paket, calisma aninda lib/resources dosyalarini fs ile okuyor ve postman-request
// (+60 transitive bagimlilik) require ediyor. Vercel serverless trace bunlari
// guvenilir takip edemedigi icin surekli "Cannot find module" / ENOENT hatasi cikiyordu.
// Bu yuzden Iyzico'nun HTTP API'sini Node'un yerlesik fetch + crypto ile dogrudan cagiriyoruz.

const BASE_URL = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com'
const API_KEY = process.env.IYZICO_API_KEY || ''
const SECRET_KEY = process.env.IYZICO_SECRET_KEY || ''

// iyzipay/lib/utils.js -> formatPrice ile birebir ayni davranis
function formatPrice(price: number | string): string {
    const n = parseFloat(String(price))
    if (!isFinite(n)) return String(price)
    const s = n.toString()
    return s.indexOf('.') === -1 ? s + '.0' : s
}

function generateRandomString(): string {
    return Date.now().toString() + crypto.randomBytes(8).toString('hex')
}

// IYZWSv2 imzasi (iyzipay/lib/utils.js -> generateHashV2 ile birebir ayni)
function buildAuthHeader(uriPath: string, bodyStr: string, randomString: string): string {
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(randomString + uriPath + bodyStr)
        .digest('hex')

    const authorizationParams = [
        'apiKey:' + API_KEY,
        'randomKey:' + randomString,
        'signature:' + signature,
    ]
    const base64 = Buffer.from(authorizationParams.join('&')).toString('base64')
    return 'IYZWSv2 ' + base64
}

async function iyzicoPost(uriPath: string, body: Record<string, unknown>): Promise<any> {
    // ONEMLI: imzada kullanilan string ile gonderilen govde BYTE BYTE ayni olmali.
    // Bu yuzden ayni stringi hem imza hem fetch body icin kullaniyoruz.
    const bodyStr = JSON.stringify(body)
    const randomString = generateRandomString()
    const authorization = buildAuthHeader(uriPath, bodyStr, randomString)

    const res = await fetch(BASE_URL + uriPath, {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'x-iyzi-rnd': randomString,
            'x-iyzi-client-version': 'iyzipay-node-2.0.67',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: bodyStr,
    })

    const text = await res.text()
    try {
        return JSON.parse(text)
    } catch {
        return { status: 'failure', errorMessage: 'Iyzico gecersiz yanit dondu', raw: text, httpStatus: res.status }
    }
}

export const IYZICO_LOCALE_TR = 'tr'
export const IYZICO_CURRENCY_TRY = 'TRY'
export const IYZICO_PAYMENT_GROUP_PRODUCT = 'PRODUCT'
export const IYZICO_BASKET_ITEM_VIRTUAL = 'VIRTUAL'

export interface CheckoutInitializeParams {
    conversationId: string
    price: number | string
    paidPrice: number | string
    basketId: string
    callbackUrl: string
    enabledInstallments?: number[]
    buyer: Record<string, unknown>
    shippingAddress: Record<string, unknown>
    billingAddress: Record<string, unknown>
    basketItems: Array<Record<string, unknown>>
}

export async function checkoutFormInitialize(params: CheckoutInitializeParams): Promise<any> {
    const body = {
        locale: IYZICO_LOCALE_TR,
        conversationId: params.conversationId,
        price: formatPrice(params.price),
        paidPrice: formatPrice(params.paidPrice),
        currency: IYZICO_CURRENCY_TRY,
        basketId: params.basketId,
        paymentGroup: IYZICO_PAYMENT_GROUP_PRODUCT,
        callbackUrl: params.callbackUrl,
        enabledInstallments: params.enabledInstallments || [1, 2, 3, 6, 9],
        buyer: params.buyer,
        shippingAddress: params.shippingAddress,
        billingAddress: params.billingAddress,
        basketItems: params.basketItems,
    }
    return iyzicoPost('/payment/iyzipos/checkoutform/initialize/auth/ecom', body)
}

export async function checkoutFormRetrieve(token: string, conversationId?: string): Promise<any> {
    const body: Record<string, unknown> = {
        locale: IYZICO_LOCALE_TR,
        token,
    }
    if (conversationId) body.conversationId = conversationId
    return iyzicoPost('/payment/iyzipos/checkoutform/auth/ecom/detail', body)
}
