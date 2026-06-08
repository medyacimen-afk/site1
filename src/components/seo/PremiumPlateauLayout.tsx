import React from 'react';
import Link from 'next/link';
import { 
    MessageCircle, Calendar, Camera, CheckCircle, 
    ChevronDown, Star, MapPin, ShieldCheck, Clock, 
    ArrowRight, X, UserCheck, Zap, Shield, Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PremiumPlateauLayoutProps {
    slug: string;
    district: string;
    service: string;
    seoContent: {
        title: string;
        description: string;
        h1: string;
        content: string;
        faqs: { q: string, a: string }[];
    };
    uniquePhotos: any[];
}

export default function PremiumPlateauLayout({ 
    slug,
    district,
    service,
    seoContent,
    uniquePhotos 
}: PremiumPlateauLayoutProps) {
    
    // Determine if it's specifically Botanik Garden to show the custom text
    const isBotanik = slug.includes('botanik-garden');
    const plateauName = district.replace(' Çekim Platosu', ''); // Remove duplicate if exists

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
            {/* Top Authority Header */}
            <div className="bg-[#fafaf9] border-b border-black/5 py-3 text-center">
                <p className="text-[10px] text-slate-900 font-bold tracking-[0.3em] uppercase">
                    Tescilli Marka: Sivas Düğün Fotoğrafçısı® - Taklitlerimizden Sakınınız
                </p>
            </div>

            {/* Immersive Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
                        alt={`${plateauName} Çekim Platosu`}
                        className="w-full h-full object-cover scale-105 opacity-50 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white" />
                </div>

                {/* VISUAL BADGE / SEAL - GOLD STYLE */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="relative group">
                        <div className="absolute inset-0 border-2 border-primary/40 rounded-full animate-[spin_12s_linear_infinite]" />
                        <div className="w-24 h-24 bg-white/80 backdrop-blur-xl border border-primary/60 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-primary/10">
                            <span className="text-[8px] font-black text-primary uppercase tracking-tighter mb-0.5">RESMÎ MARKA</span>
                            <span className="text-2xl font-black text-slate-900 leading-none">®</span>
                            <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest mt-1">SİVAS</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center mt-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/5 shadow-sm mb-8">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-slate-900 text-[10px] font-bold tracking-[0.3em] uppercase">Sivas'ın Tek Tescilli Markası</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-[6.5rem] font-bold text-slate-900 mb-8 leading-[0.9] tracking-tighter drop-shadow-sm">
                        {plateauName} <br/>
                        <span className="italic font-serif text-primary">Çekim Platosu</span>
                    </h1>
                    
                    <div className="max-w-3xl mx-auto mb-12">
                        <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
                            {seoContent.description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link 
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || ''}`}
                            className="w-full sm:w-auto bg-primary text-primary-foreground px-12 py-6 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                        >
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp Bilgi Hattı
                        </Link>
                        <Link 
                            href="/online-rezervasyon"
                            className="w-full sm:w-auto bg-white backdrop-blur-md text-slate-900 border border-black/10 px-12 py-6 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                        >
                            <Calendar className="w-5 h-5" />
                            Randevunuzu Ayırın
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Icons */}
            <section className="py-24 bg-white relative z-10 border-b border-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { icon: UserCheck, title: "Profesyonel Partner", desc: "Mekan çekim standartlarına tam uyumlu, yetkin uzman ekip." },
                            { icon: Camera, title: "Ultra HD Detaylar", desc: "Sony A7R V teknolojisi ile her ayrıntıda kristal netliği." },
                            { icon: Clock, title: "Hızlı Galeri", desc: "20 gün içerisinde albüm ve dijital arşiv teslimat garantisi." },
                            { icon: Zap, title: "Anlık Paylaşım", desc: "Çekim günü teslim edilen özel Reels ve hikaye kurguları." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100/60 shadow-sm flex flex-col items-center text-center group hover:border-primary/30 transition-all hover:-translate-y-2">
                                <item.icon className="w-8 h-8 text-slate-900 mb-6 group-hover:text-primary transition-colors" />
                                <h3 className="text-sm font-bold mb-3 text-slate-900 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">
                            <div className="lg:col-span-12 xl:col-span-7">
                                
                                {/* 1. The Unique AI-Generated SEO Content (Prevents SPAM & Duplicate Content) */}
                                <div className="mb-16 prose prose-lg prose-slate max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {seoContent.content}
                                    </ReactMarkdown>
                                </div>

                                {/* 2. The User's Specific Legal Warning Boilerplate for Botanik Garden */}
                                {isBotanik && (
                                    <div className="mb-16 bg-[#fafaf9] border border-black/5 p-8 md:p-12 rounded-[3rem] shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]" />
                                        
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 text-slate-900 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                                            <Info className="w-4 h-4 text-primary" /> Botanik Garden Seçim Rehberi
                                        </div>
                                        
                                        <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed space-y-6 relative z-10">
                                            <p className="font-medium text-lg text-slate-800">
                                                Botanik Garden çekim platosu, ahşap dokuları ve geniş peyzaj alanlarıyla Sivas'ta dış çekim denince akla gelen ilk noktalardan biridir. Ancak bu mekanı sadece "güzel bir yer" olarak görmek, elde edeceğiniz hatıraları kısıtlamaktır.
                                            </p>
                                            <p>
                                                <strong>Sony A7R V</strong>'in 61 megapiksellik sensörüyle yaptığımız çekimlerde, mekanın ahşap sıcaklığını ve bitki dokularını insan teninin en doğal renkleriyle birleştiriyoruz. Özellikle "Altın Saat" (Golden Hour) olarak bilinen gün batımı vaktinde, Botanik Garden'ın ışık açısını saniyesi saniyesine planlayarak, vizörümüze gelen ters ışığı sanatsal bir flare etkisine dönüştürüyoruz.
                                            </p>
                                            
                                            <div className="bg-white border-l-4 border-primary p-8 rounded-r-3xl my-8 shadow-sm">
                                                <h4 className="text-slate-900 font-black text-xl mb-3 flex items-center gap-2 uppercase italic tracking-tight">
                                                    <ShieldCheck className="w-6 h-6 text-primary" /> Mekan Kuralları ve Seçim Hakkınız
                                                </h4>
                                                <p className="text-slate-600 italic font-medium">
                                                    Sivas genelinde bazı düğün mekanları ve gelinlikçilerin "kendi fotoğrafçımız var, dışarıdan ekip kabul etmiyoruz" şeklindeki yasa dışı ve etik olmayan söylemleriyle karşılaşıyoruz. Unutmayın ki; bir çekim platosuna giriş ücretini (mekan kirasını) ödediğiniz sürece, sanatçınızı seçme özgürlüğünüz Türkiye Cumhuriyeti tüketici hakları ve ticaret kanunu ile güvence altındadır. Anlaştığınız mekanın görsel güzelliği işletmeye aittir; ancak aşkınızın nasıl belgeleneceği sadece sizin kararınızdır. Seçim hakkınızın kısıtlandığı her noktada, sanatın değil ticari komisyonların öncelendiğini unutmayın.
                                                </p>
                                            </div>

                                            <p>
                                                Biz çekimlerimizde mekanı sadece bir dekor olarak değil, hikayenizin bir parçası olarak kurguluyoruz. Fabrikasyon usulü, bir günde onlarca çifti yarımşar saatte çeken mekan ekiplerinin aksine; Sivas Düğün Fotoğrafçısı olarak her çekimden önce mekana giderek ışık kontrolü yapıyor, size özel "styling" ve "posing" planları hazırlıyoruz. Sony'nin AI destekli netleme teknolojisiyle en hareketli, en gerçek anlarınızı bile kaçırmadan donduruyoruz.
                                            </p>

                                            <blockquote className="border-l-8 border-primary pl-8 py-6 my-8 bg-white rounded-r-3xl shadow-sm">
                                                <p className="italic text-slate-900 font-black text-xl leading-relaxed m-0 tracking-tight">
                                                    "Seçiminizi başkalarının ticari ortaklıkları değil, kendi estetik zevkiniz belirlesin. Sivas'ın en güzel platolarında, sadece mekana değil vizyona odaklanan çekimler yapıyoruz."
                                                </p>
                                            </blockquote>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                    <div className="bg-[#fafaf9] p-12 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all hover:border-primary/20 hover:shadow-xl">
                                        <h4 className="flex items-center gap-3 mb-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            Yazın Ferahlığı
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed font-bold italic">
                                            Kavurucu Sivas sıcağında, gelin ve damatlarımızın konforu için özel olarak tasarlanmış serin dinlenme alanları ve gölge konseptlerle ferah bir çekim deneyimi sunuyoruz.
                                        </p>
                                    </div>
                                    <div className="bg-[#fafaf9] p-12 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all hover:border-primary/20 hover:shadow-xl">
                                        <h4 className="flex items-center gap-3 mb-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            Kışın Sıcaklığı
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed font-bold italic">
                                            Yağmur, kar veya çamur... Modern kapalı stüdyolar ve ısıtmalı iç mekan konseptleri sayesinde, dışarıdaki hava ne olursa olsun çekimlerimize kesintisiz devam ediyoruz.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-12 xl:col-span-5 border-2 border-slate-900 p-12 rounded-[4rem] shadow-[20px_20px_0px_#facc15] sticky top-24 bg-white">
                                <h3 className="text-2xl font-black mb-10 text-slate-900 uppercase tracking-tighter italic">Hukuki Rehber & SSS</h3>
                                <div className="space-y-4">
                                    {seoContent.faqs.map((faq, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:border-primary/30">
                                            <span className="font-black text-sm text-slate-900 block mb-2 uppercase italic">{faq.q}</span>
                                            <span className="text-sm text-slate-600 leading-relaxed font-medium">{faq.a}</span>
                                        </div>
                                    ))}
                                    <div className="p-6 bg-primary/10 rounded-2xl border border-primary/30">
                                        <span className="font-black text-sm text-primary block mb-2 uppercase italic">Kendi fotoğrafçımızı dışarıdan getirebilir miyiz?</span>
                                        <span className="text-sm text-slate-700 leading-relaxed font-medium">KESİNLİKLE EVET. Tüketici hakları çerçevesinde profesyonel ekibimizi getirme hakkınız yasal güvence altındadır. Mekanın size çekim ekibi dayatmaya yasal hakkı yoktur.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Niçin Biz? Comparison Table */}
                        <div className="mb-40">
                            <div className="text-center mb-16 px-4">
                                <h3 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Niçin Biz?</h3>
                                <p className="text-primary italic font-serif text-xl font-bold">Sıradan Metotlarla Sanat Arasındaki Fark</p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch px-4">
                                {/* Ordinary side */}
                                <div className="bg-[#fafaf9] p-12 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                            <X className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-400 italic uppercase tracking-wider">Sıradan Seçenekler</h4>
                                    </div>
                                    <ul className="space-y-6 text-sm text-slate-500 font-medium italic relative z-10">
                                        <li className="flex gap-4 items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Fabrikasyon, ezbere pozlar.</li>
                                        <li className="flex gap-4 items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Yetkisiz ve tecrübesiz ekipler.</li>
                                        <li className="flex gap-4 items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Hızlı bitsin mantığıyla acele çekimler.</li>
                                        <li className="flex gap-4 items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Tescilsiz hesapların dolandırıcılık riskleri.</li>
                                    </ul>
                                </div>

                                {/* Premium side */}
                                <div className="bg-white p-12 rounded-[3rem] border-2 border-primary shadow-[0_20px_50px_-12px_rgba(250,204,21,0.15)] relative overflow-hidden transform lg:-translate-y-4">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                                    <div className="flex items-center gap-4 mb-10 relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Star className="w-6 h-6 text-primary fill-primary" />
                                        </div>
                                        <h4 className="text-2xl font-black uppercase italic tracking-widest text-slate-900">RESMÎ MARKA®</h4>
                                    </div>
                                    <ul className="space-y-8 text-base text-slate-700 font-bold relative z-10">
                                        <li className="flex gap-4 items-center"><CheckCircle className="w-6 h-6 text-primary flex-shrink-0" /> Sanatsal ve butik kurgu.</li>
                                        <li className="flex gap-4 items-center"><CheckCircle className="w-6 h-6 text-primary flex-shrink-0" /> Vizyon sahibi uzman sanatçılar.</li>
                                        <li className="flex gap-4 items-center"><CheckCircle className="w-6 h-6 text-primary flex-shrink-0" /> Sony A7R V ile ultra yüksek kalite.</li>
                                        <li className="flex gap-4 items-center"><CheckCircle className="w-6 h-6 text-primary flex-shrink-0" /> %100 Güven ve 20 Günde Teslim.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Grid */}
                        {uniquePhotos && uniquePhotos.length > 0 && (
                            <div className="mb-40">
                                <div className="flex items-end justify-between mb-16">
                                    <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter border-b-4 border-primary pb-2">{plateauName} Vizörümüz</h3>
                                    <Link href="/portfolio" className="text-xs font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">Tüm Portfolyo <ArrowRight className="w-3 h-3" /></Link>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {uniquePhotos.slice(0, 4).map((photo: any) => (
                                        <div key={photo.id} className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative group cursor-pointer">
                                            <img src={photo.image} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-x-4 bottom-4 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-white font-black uppercase text-center tracking-[0.3em]">RESMÎ MARKA®</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Final CTA */}
                        <div className="bg-[#fafaf9] py-32 rounded-[5rem] text-center relative overflow-hidden shadow-2xl shadow-black/[0.03] border border-black/5">
                             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                             <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                             
                             <h2 className="text-5xl md:text-[6.5rem] font-bold mb-10 tracking-tighter text-slate-900 leading-[0.9] relative z-10">
                                En Özel Gününüz İçin <br />
                                <span className="italic font-serif text-primary">Hazırız.</span>
                            </h2>
                            <p className="max-w-2xl mx-auto mb-16 text-slate-500 text-xl font-medium leading-relaxed relative z-10">
                                Sivas'ın tescilli markasıyla, hatıralarınızı sanat eserine dönüştürelim.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                                <Link href="/online-rezervasyon" className="bg-primary text-primary-foreground px-12 py-6 rounded-full font-black text-lg w-full sm:w-auto uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                                    <Calendar className="w-5 h-5" /> Randevu Al
                                </Link>
                                <Link href={`tel:${process.env.NEXT_PUBLIC_PHONE || ''}`} className="bg-white text-slate-900 px-12 py-6 rounded-full font-black text-lg border border-black/10 w-full sm:w-auto uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <MessageCircle className="w-5 h-5" /> İletişim
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Legal Footer Disclaimer */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 text-center opacity-40">
                    <Shield className="w-10 h-10 mx-auto mb-8 text-slate-900" />
                    <p className="text-[10px] text-slate-900 font-black uppercase tracking-[0.5em]">SİVAS DÜĞÜN FOTOĞRAFÇISI® TESCİLLİ MARKADIR. TÜM HAKLARI SAKLIDIR.</p>
                </div>
            </section>
        </div>
    );
}
