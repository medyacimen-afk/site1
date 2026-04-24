import React from 'react'
import { motion } from 'framer-motion'

export const metadata = {
    title: 'Gizlilik Politikası | Sivas Düğün Fotoğrafçısı',
    description: 'Sivas Düğün Fotoğrafçısı gizlilik politikası ve veri güvenliği bilgilendirmesi.'
}

export default function PrivacyPolicy() {
    return (
        <main className="pt-32 pb-24 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif mb-12 text-foreground">Gizlilik Politikası</h1>
                
                <div className="prose prose-slate max-w-none text-foreground/70 font-light leading-relaxed space-y-8">
                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">1. Veri Toplama</h2>
                        <p>
                            Sivas Düğün Fotoğrafçısı olarak, web sitemiz üzerinden yapılan rezervasyon ve iletişim formları aracılığıyla adınız, telefon numaranız ve e-posta adresiniz gibi kişisel bilgileri topluyoruz. Bu bilgiler, size hizmet sunabilmemiz ve rezervasyon süreçlerini yönetebilmemiz için gereklidir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">2. Veri Kullanımı</h2>
                        <p>
                            Toplanan kişisel bilgiler, yalnızca rezervasyon onayları, bilgilendirme mesajları ve hizmet kalitemizi artırmak amacıyla kullanılır. Bilgileriniz, yasal zorunluluklar haricinde üçüncü şahıs veya kurumlarla asla paylaşılmaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">3. Ödeme Güvenliği</h2>
                        <p>
                            Ödeme işlemleri Iyzico güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kart bilgileriniz tarafımızca saklanmaz ve 256-bit SSL sertifikası ile korunur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">4. Çerezler (Cookies)</h2>
                        <p>
                            Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerez kullanımını kısıtlayabilirsiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">5. İletişim</h2>
                        <p>
                            Gizlilik politikamız hakkındaki sorularınız için sivasdugunfotografcisi@gmail.com adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
