import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { districts, services, slugify, parseSlug, regionLocations, specialPages } from '@/lib/seo-data';
import { generateSeoContent } from '@/lib/ai-seo';
import JsonLd from '@/components/seo/JsonLd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Phone, MessageCircle, Calendar, MapPin, ChevronDown, CheckCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import PremiumPlateauLayout from '@/components/seo/PremiumPlateauLayout';

interface SEOPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SEOPageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = parseSlug(slug);

    if (!data) return {};

    let pageTitle = '';
    let pageDesc = '';

    if (data.type === 'special') {
        pageTitle = data.page?.title || '';
        pageDesc = `${data.page?.title} — ${data.page?.location} bölgesinde profesyonel ${data.page?.service}. Sony A7R V kameralar ve DJI Mavic 3 Pro drone ile sanatsal çekim, 20 günde teslimat.`;
    } else if (data.type === 'district-service') {
        const loc = (data as any).region ? `${data.district?.name} (${(data as any).region})` : data.district?.name;
        pageTitle = `${data.district?.name} ${data.service?.name}`;
        pageDesc = `${loc} bölgesinde profesyonel ${data.service?.name}. Sony A7R V kameralar ve DJI Mavic 3 Pro teknolojisi ile 20 günde albüm teslimatı.`;
    } else if (data.type === 'plateau-query') {
        const plateauShort = data.plateau?.name?.replace(' Çekim Platosu', '') || '';
        pageTitle = `${plateauShort} ${data.query?.name}`;
        pageDesc = `${plateauShort} çekim platosunda profesyonel ${data.query?.name}. Sony A7R V ile dört mevsim konforlu çekim.`;
    } else if (data.type === 'plateau') {
        pageTitle = data.plateau?.name || '';
        pageDesc = `${data.plateau?.name} - Sivas'ın en prestijli çekim platosunda profesyonel dış çekim. Sony A7R V kalitesi.`;
    }

    return {
        title: pageTitle,
        description: pageDesc,
        alternates: {
            canonical: `/${slug}`,
        }
    };
}

export async function generateStaticParams() {
    const params = [];
    
    // Generate params for all 17 districts and key commercial/price services
    const priceServices = services.filter(s => s.category === 'Ticari' || s.category === 'Temel').slice(0, 15);

    for (const d of districts) {
        for (const s of priceServices) {
            params.push({ slug: `${slugify(d.name)}-${s.id}` });
        }
    }

    // Çevre il/ilçeler için temel hizmet sayfaları (ön-render edilen alt küme)
    const coreRegionServices = services
        .filter(s => ['dugun-fotografcisi', 'dis-cekim-fotografcisi', 'dugun-klibi-montaj', 'nisan-fotografcisi'].includes(s.id));
    for (const loc of regionLocations) {
        for (const s of coreRegionServices) {
            params.push({ slug: `${loc.slug}-${s.id}` });
        }
    }

    // Özel konsept çekim sayfaları
    for (const sp of specialPages) {
        params.push({ slug: sp.slug });
    }

    // Multiply plateau links (Link Multiplier for BOTANIK GARDEN etc.)
    const { plateaus, plateauQueries } = require('@/lib/seo-data');
    for (const p of plateaus) {
        // Base plateau link
        params.push({ slug: p.id });
        // Specialty links (Multiplier)
        for (const q of plateauQueries) {
            params.push({ slug: `${p.id}-${q.id}` });
        }
    }

    return params;
}

export default async function SEOPage({ params }: SEOPageProps) {
    const { slug } = await params;
    const data = parseSlug(slug);

    if (!data) notFound();

    let district = '';
    let service = '';
    let landmarks: string[] = [];
    let region = 'Sivas';

    if (data.type === 'special') {
        district = data.page?.location || '';
        service = data.page?.service || '';
        landmarks = data.page?.landmarks || [];
        region = data.page?.location || 'Sivas';
    } else if (data.type === 'district-service') {
        district = data.district?.name || '';
        service = data.service?.name || '';
        landmarks = data.district?.landmarks || [];
        region = (data as any).region || 'Sivas';
    } else if (data.type === 'plateau') {
        district = data.plateau?.name || 'Sivas';
        service = 'Dış Çekim';
        landmarks = [data.plateau?.name || ''];
    } else if (data.type === 'plateau-query') {
        district = data.plateau?.name || 'Sivas';
        service = data.query?.name || '';
        landmarks = [data.plateau?.name || ''];
    }

    const seoContent = await generateSeoContent(district, service, landmarks, data.type, region);

    // Dynamic Portfolio Fetching & Unique Selection
    let uniquePhotos: any[] = [];
    try {
        const portfolioQuery = query(collection(db, 'portfolio'), limit(15));
        const portfolioSnap = await getDocs(portfolioQuery);
        const allPhotos = portfolioSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (allPhotos.length > 0) {
            // Deterministic random selection based on slug
            const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            uniquePhotos = allPhotos
                .sort((a, b) => {
                    const hashA = (a.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + seed) % allPhotos.length;
                    const hashB = (b.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + seed) % allPhotos.length;
                    return hashA - hashB;
                })
                .slice(0, 6);
        }
    } catch (error) {
        console.error("Portfolio fetch error:", error);
    }

    if (!seoContent) {
        return (
            <div className="pt-40 pb-20 container mx-auto px-4 text-center">
                <h1 className="text-4xl font-serif mb-8">{district} {service}</h1>
                <p>İçerik yüklenemedi. Lütfen tekrar deneyin.</p>
            </div>
        );
    }

    const relatedServices = services
        .filter(s => s.name !== service)
        .slice(0, 8);

    // İç bağlantı tabanı: özel konsept sayfalarında geçerli bir konum slug'ı olmadığından Sivas'a yönlendir.
    const linkBase = data.type === 'special' ? 'sivas' : slugify(district);

    // Determine if we should use the Premium Layout
    const isPremium = slug.includes('botanik-garden');

    if (isPremium) {
        return (
            <PremiumPlateauLayout 
                slug={slug}
                district={district}
                service={service}
                seoContent={seoContent}
                uniquePhotos={uniquePhotos}
            />
        );
    }

    const heroImage = uniquePhotos.length > 0 ? uniquePhotos[0].image : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop";

    return (
        <main className="bg-white min-h-screen">
            <JsonLd 
                type="ProfessionalService"
                data={{
                    "name": `${district} ${service} - Sivas Düğün Fotoğrafçısı`,
                    "description": seoContent.description,
                    "areaServed": {
                        "@type": "City",
                        "name": district
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `{process.env.NEXT_PUBLIC_SITE_URL || 'https://fotografci.com'}/${slug}`
                    }
                }}
            />

            {/* Immersive Hero Section (White Premium Concept) */}
            <section className="relative pt-48 pb-32 overflow-hidden flex items-center justify-center min-h-[75vh]">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={heroImage} 
                        alt={`${district} ${service}`}
                        className="w-full h-full object-cover scale-105 opacity-40 grayscale"
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
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-slate-900 text-[10px] font-bold tracking-[0.3em] uppercase">{district} PRO & PREMIUM ÇEKİM</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-[6.5rem] font-bold text-slate-900 mb-8 leading-[0.9] tracking-tighter drop-shadow-sm">
                        {district} <br/>
                        <span className="italic font-serif text-primary">{service}</span>
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
                            Randevu Al
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content & Features */}
            <section className="py-24 bg-white relative z-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Body Text & Highlights */}
                        <div className="lg:col-span-7 prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {seoContent.content}
                            </ReactMarkdown>

                            {/* Trust Badges */}
                            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose">
                                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-black/5">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">20 Gün Teslimat</h4>
                                        <p className="text-xs text-foreground/50">Albüm ve dijitalleriniz söz verdiğimiz tarihte hazır.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-black/5">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Camera className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Modern Ekipman</h4>
                                        <p className="text-xs text-foreground/50">Sony A7R V & DJI Mavic 3 Pro ile eşsiz kalite.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Highlights - Dynamic Unique Grid */}
                            <div className="mt-20 not-prose">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="font-bold uppercase tracking-widest text-xs text-primary">{district} Vizörümüz</h4>
                                    <span className="text-[10px] text-foreground/30 uppercase tracking-widest leading-none">{district} Portfolyomuz</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {uniquePhotos.map((photo: any, i: number) => (
                                        <div key={photo.id} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group border border-black/[0.03] shadow-sm">
                                            <img 
                                                src={photo.image} 
                                                alt={photo.title} 
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                    {uniquePhotos.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group border border-black/[0.03] shadow-sm">
                                             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-6 text-[10px] text-foreground/40 italic leading-relaxed text-right">
                                    * Yukarıdaki görseller {district} {service} kapsamında gerçekleştirdiğimiz profesyonel çekimlerin örnekleridir.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar & Related Links */}
                        <div className="lg:col-span-5 space-y-12">
                            {/* FAQ Section */}
                            <div className="bg-[#fafaf9] p-10 md:p-16 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/[0.02]">
                                <h3 className="text-3xl font-medium mb-10 tracking-tight">{district} Hakkında Merak Edilenler</h3>
                                <div className="space-y-6">
                                    {seoContent.faqs.map((faq, idx) => (
                                        <details key={idx} className="group border-b border-black/5 pb-6">
                                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                                <span className="text-sm font-bold pr-6 group-open:text-primary transition-colors">{faq.q}</span>
                                                <ChevronDown className="w-4 h-4 text-foreground/40 group-open:rotate-180 transition-transform" />
                                            </summary>
                                            <div className="mt-4 text-sm text-foreground/50 leading-relaxed font-light">
                                                {faq.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>

                            {/* Internal Linking */}
                            <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-[100px] -mr-32 -mt-32" />
                                <h3 className="text-2xl font-sans font-medium mb-8 relative z-10">{district}'daki Diğer Hizmetlerimiz</h3>
                                <div className="grid grid-cols-1 gap-3 relative z-10">
                                    {relatedServices.map((rs) => (
                                        <Link 
                                            key={rs.id}
                                            href={`/${linkBase}-${rs.id}`}
                                            className="group/item flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs"
                                        >
                                            <span className="opacity-70 group-hover/item:opacity-100 transition-opacity">{rs.name}</span>
                                            <ArrowRight className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Container */}
            <section className="pb-32 bg-white relative z-10">
                <div className="container mx-auto px-4">
                    <div className="mt-16 bg-[#fafaf9] py-32 rounded-[5rem] text-center relative overflow-hidden shadow-2xl shadow-black/[0.03] border border-black/5">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                        
                        <h2 className="text-5xl md:text-[6.5rem] font-bold mb-10 tracking-tighter text-slate-900 leading-[0.9] relative z-10">
                            {district} İçin <br />
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
            </section>
        </main>
    );
}
