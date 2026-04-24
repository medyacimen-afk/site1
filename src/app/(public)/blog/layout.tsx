import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Blog | Sivas Düğün Fotoğrafçısı",
    description: "Sivas düğün fotoğrafçısı olarak, çekim ipuçları, 2025 sezonu trendleri ve özel günlerinize hazırlık rehberi.",
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
