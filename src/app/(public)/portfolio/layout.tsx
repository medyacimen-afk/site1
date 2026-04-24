import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Portfolyo | Sivas Düğün Fotoğrafçısı",
    description: "Sivas'ta gerçekleştirdiğimiz en güzel düğün hikayeleri, dış çekimler ve nişan fotoğraflarından oluşan galerimizi inceleyin.",
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
