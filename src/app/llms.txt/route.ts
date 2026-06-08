// /llms.txt — Yapay zeka motorları için site rehberi
// llmstxt.org standardı — site ayarlarından otomatik beslenir

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://fotografci.com'
const PHONE = process.env.NEXT_PUBLIC_PHONE || ''
const WHATSAPP_NUM = process.env.NEXT_PUBLIC_WHATSAPP || ''

export const dynamic = 'force-static'
export const revalidate = 86400

function buildContent(): string {
    const lines: string[] = []

    lines.push('# Profesyonel Düğün Fotoğrafçısı')
    lines.push('')
    lines.push('> Profesyonel düğün fotoğrafçılığı ve dış çekim hizmetleri.')
    lines.push('')

    lines.push('## Önemli Sayfalar')
    lines.push(`- [Anasayfa](${BASE}/): Marka tanıtımı, portfolyo ve hizmet özeti`)
    lines.push(`- [Online Rezervasyon](${BASE}/online-rezervasyon): Tarih, saat, paket seçimi ve rezervasyon`)
    lines.push(`- [İletişim](${BASE}/contact): Telefon ve iletişim bilgileri`)
    lines.push(`- [Blog](${BASE}/blog): Düğün çekimi ipuçları ve rehber içerikler`)
    lines.push('')

    lines.push('## İletişim')
    if (PHONE) lines.push(`- Telefon: ${PHONE}`)
    if (WHATSAPP_NUM) lines.push(`- WhatsApp: https://wa.me/${WHATSAPP_NUM}`)
    lines.push('')

    return lines.join('\n') + '\n'
}

export async function GET() {
    return new Response(buildContent(), {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=86400',
        },
    })
}
