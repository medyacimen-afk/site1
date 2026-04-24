import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Hakkımızda | Sivas Düğün Fotoğrafçısı",
    description: "Sivas'ın marka tescilli tek stüdyosu olarak 10 yıllık tecrübemiz ve binlerce mutlu çiftimizle hikayemizi keşfedin.",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
