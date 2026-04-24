import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Online Rezervasyon | Sivas Düğün Fotoğrafçısı",
    description: "Sivas'ta hayalinizdeki düğün çekimi için online randevunuzu hemen oluşturun. Hızlı ve kolay rezervasyon sistemi.",
}

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
