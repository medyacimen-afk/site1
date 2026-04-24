import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "İletişim | Sivas Düğün Fotoğrafçısı",
    description: "En özel gününüzü ölümsüzleştirmek için bizimle iletişime geçin. Sivas merkezdeki stüdyomuz, telefon veya WhatsApp üzerinden bize ulaşın.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
