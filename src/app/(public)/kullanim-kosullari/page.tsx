import React from 'react'

export const metadata = {
    title: 'Kullanım Koşulları | Sivas Düğün Fotoğrafçısı',
    description: 'Sivas Düğün Fotoğrafçısı web sitesi kullanım koşulları ve hizmet sözleşmesi.'
}

export default function TermsOfUse() {
    return (
        <main className="pt-32 pb-24 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif mb-12 text-foreground">Kullanım Koşulları</h1>
                
                <div className="prose prose-slate max-w-none text-foreground/70 font-light leading-relaxed space-y-8">
                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">1. Hizmet Kapsamı</h2>
                        <p>
                            Bu web sitesi, Sivas Düğün Fotoğrafçısı markasının hizmetlerini tanıtmak, portfolyo sunmak ve online rezervasyon imkanı sağlamak amacıyla kurulmuştur. Sitedeki tüm içerikler (fotoğraflar, metinler, logolar) markamıza aittir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">2. Rezervasyon ve İptal</h2>
                        <p>
                            Online olarak yapılan rezervasyonlar ön onay niteliğindedir. Ödeme yapıldıktan sonra tarih kesinleşir. İptal ve iade süreçleri, çekim tarihine kalan süreye göre sözleşme şartları dahilinde değerlendirilir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">3. Fikri Mülkiyet</h2>
                        <p>
                            Sitede yer alan tüm görsellerin telif hakkı Sivas Düğün Fotoğrafçısı'na aittir. İzinsiz kopyalanması, paylaşılması veya ticari amaçla kullanılması durumunda yasal işlem başlatılır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">4. Sorumluluk Reddi</h2>
                        <p>
                            Web sitesindeki bilgilerin güncelliği ve doğruluğu için azami gayret gösterilmektedir. Teknik aksaklıklardan kaynaklanan hatalardan dolayı marka sorumlu tutulamaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-sans font-medium text-foreground mb-4">5. Değişiklik Hakları</h2>
                        <p>
                            Sivas Düğün Fotoğrafçısı, kullanım koşullarını dilediği zaman güncelleme hakkını saklı tutar.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
