export const districts = [] as { id: string; name: string; landmarks: string[] }[];

export const services = [
    { id: "dugun-fotografcisi", name: "Düğün Fotoğrafçısı", category: "Temel" },
    { id: "en-iyi-dugun-fotografcisi", name: "En İyi Düğün Fotoğrafçısı", category: "Temel" },
    { id: "en-populer-dugun-fotografcisi", name: "En Popüler Düğün Fotoğrafçısı", category: "Temel" },
    { id: "dugun-hikayesi-cekimi", name: "Düğün Hikayesi Çekimi", category: "Temel" },
    { id: "dis-cekim-fotografcisi", name: "Dış Çekim Fotoğrafçısı", category: "Temel" },
    { id: "dugun-klibi-montaj", name: "Düğün Klibi ve Video Montaj", category: "Temel" },
    { id: "nisan-fotografcisi", name: "Nişan ve Söz Fotoğrafçısı", category: "Temel" },
    { id: "kina-gecesi-cekimi", name: "Kına Gecesi Kamera Çekimi", category: "Temel" },
    { id: "drone-gelin-alma", name: "Gelin Alma Drone Çekimi", category: "Geleneksel" },
    { id: "kiz-cikarma-video", name: "Kız Çıkarma Video Çekimi", category: "Geleneksel" },
    { id: "konvoy-kamera-cekimi", name: "Konvoy Kamera Çekimi", category: "Geleneksel" },
    { id: "gelin-hamami-fotograf", name: "Gelin Hamamı Fotoğraf Çekimi", category: "Geleneksel" },
    { id: "save-the-date", name: "Save the Date Çekimi", category: "Modern" },
    { id: "trash-the-dress", name: "Trash the Dress", category: "Modern" },
    { id: "first-look-cekimi", name: "First Look (İlk Bakış)", category: "Modern" },
    { id: "dugun-belgeseli", name: "Düğün Belgeseli Yapımı", category: "Modern" },
    { id: "dis-cekim-yerleri", name: "En İyi Dış Çekim Yerleri", category: "Mekan" },
    { id: "dugun-fotografcisi-fiyatlari", name: "Düğün Fotoğrafçısı Fiyatları", category: "Ticari" },
    { id: "kina-gecesi-cekimi-fiyatlari", name: "Kına Gecesi Çekimi Fiyatları", category: "Ticari" },
    { id: "gelin-alma-cekimi-fiyatlari", name: "Gelin Alma Çekimi Fiyatları", category: "Ticari" },
    { id: "nisan-cekimi-fiyatlari", name: "Nişan Çekimi Fotoğraf Fiyatları", category: "Ticari" },
    { id: "dis-cekim-fiyatlari", name: "Dış Çekim Fotoğraf Fiyatları", category: "Ticari" },
    { id: "sunnet-fotografcisi-fiyatlari", name: "Sünnet Fotoğrafçısı Fiyatları", category: "Ticari" },
    { id: "dis-cekim-paketleri", name: "Dış Çekim Paketleri", category: "Ticari" }
];

export const plateaus = [] as { id: string; name: string }[];

export const plateauQueries = [
    { id: "cekimi", name: "Çekim Paketi" },
    { id: "sivas", name: "Sivas Çekim Platosu" },
    { id: "dugun-cekimi", name: "Düğün Çekimi" },
    { id: "sivas-dugun", name: "Düğün Fotoğrafçısı" },
    { id: "nisan-cekimi", name: "Nişan Çekimi" },
    { id: "kina-cekimi", name: "Kına Çekimi" },
    { id: "dugun-oncesi-cekim", name: "Düğün Öncesi Çekim (Engagement)" },
    { id: "fiyat", name: "Dış Çekim Fiyatları" },
    { id: "paket", name: "Çekim Paketleri" },
    { id: "rezervasyon", name: "Rezervasyon ve İletişim" },
    { id: "randevu", name: "Randevu ve Bilgi" },
    { id: "randevu-al", name: "Online Randevu Al" },
    { id: "online-randevu", name: "Online Randevu Sistemi" },
    { id: "iletisim", name: "İletişim Bilgileri" },
    { id: "telefon", name: "Telefon ve WhatsApp" },
    { id: "gi̇ri̇s-ucreti", name: "Giriş Ücreti ve Şartlar" },
    { id: "fotografci", name: "En İyi Fotoğrafçı" },
    { id: "en-guzel-cekim-platosu", name: "En Güzel Çekim Platosu" },
    { id: "acik-hava-dugun-cekimi", name: "Açık Hava Düğün Çekimi" },
    { id: "dis-cekim-yerleri", name: "Dış Çekim Yerleri Rehberi" },
    { id: "album-cekimi", name: "Albüm ve Çekim Serisi" },
    { id: "fiyatlari-2024", name: "2024 Yılı Dış Çekim Fiyatları" },
    { id: "fiyatlari-2025", name: "2025 Yılı Dış Çekim Fiyatları" },
    { id: "fiyatlari-2026", name: "2026 Yılı Dış Çekim Fiyatları" },
    { id: "drone-cekimi", name: "Profesyonel Drone Çekimi" },
    { id: "dugun-klibi", name: "Düğün Klibi ve Hikayesi" },
    { id: "save-the-date", name: "Save the Date Çekimi" },
    { id: "trash-the-dress", name: "Trash the Dress (Elbise Kirletme)" },
    { id: "first-look", name: "First Look (İlk Bakış) Çekimi" },
    { id: "tavsiye", name: "Fotoğrafçı Tavsiyeleri" },
    { id: "en-iyi-dugun-fotografcisi", name: "En İyi Düğün Fotoğrafçısı" },
    { id: "profesyonel-album-seti", name: "Profesyonel Albüm Setleri" },
    { id: "nasil-gidilir", name: "Nerede? ve Nasıl Gidilir?" },
    { id: "iletisim-numarasi", name: "İletişim Telefon Numarası" },
    { id: "cekimi-saatleri", name: "Çekim Saatleri ve Randevu" },
    { id: "gelin-damat-pozlari", name: "En Güzel Gelin Damat Pozları" },
    { id: "dugun-belgeseli", name: "Düğün Belgeseli Yapımı" },
    { id: "konsept-cekimi", name: "Tematik Konsept Çekimleri" },
    { id: "sivas-dugun-hikayesi", name: "Sivas Düğün Hikayesi" },
    { id: "dis-mekan-cekimi", name: "Dış Mekan Fotoğraf Çekimi" },
    { id: "gece-cekimi", name: "Gece Dış Çekim Teknikleri" },
    { id: "gün-batimi-cekimi", name: "Gün Batımı (Golden Hour) Çekimi" },
    { id: "cekimi-kac-para", name: "Çekim Ücreti Ne Kadar?" },
    { id: "cekimi-kurallari", name: "Mekan Çekim Kuralları" },
    { id: "en-populer-cekim-platosu", name: "Sivas'ın En Popüler Platosu" },
    { id: "fotografci-fiyatlari", name: "Fotoğrafçı Çekim Fiyatları" },
    { id: "sunnet-cekimi", name: "Sünnet Fotoğraf Çekimi" },
    { id: "dogum-gunu-cekimi", name: "Doğum Günü Çekimi" },
    { id: "aile-cekimi", name: "Aile Fotoğraf Çekimi" },
    { id: "bebek-cekimi", name: "Bebek ve Hamile Çekimi" },
    { id: "mezuniyet-cekimi", name: "Mezuniyet Fotoğraf Çekimi" }
];

export const slugify = (text: string) => {
    const trMap: { [key: string]: string } = {
        'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g', 
        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
    };
    
    let str = text.toString();
    for (const key in trMap) {
        str = str.replace(new RegExp(key, 'g'), trMap[key]);
    }

    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// ——— Sivas dışında yerinde çekim hizmeti verilen çevre iller ve ilçeleri ———
// Bu bölgeler de gerçek landing page'lere sahiptir ([slug] sayfası konum-bağımsız çalışır).
export const regionProvinces = [] as { province: string; districts: string[] }[];

// regionProvinces'i benzersiz konum listesine düzleştir.
// - Her ilin "Merkez"i, il adıyla temsil edilir (ör. Tokat -> tokat-dugun-fotografcisi).
// - Çakışan slug'lar (ör. Sivas ilçeleriyle veya kendi aralarında) atlanır.
export const regionLocations: { name: string; slug: string; province: string; landmarks: string[] }[] = (() => {
    const seen = new Set<string>(districts.map((d) => slugify(d.name)));
    const out: { name: string; slug: string; province: string; landmarks: string[] }[] = [];
    for (const r of regionProvinces) {
        const pSlug = slugify(r.province);
        if (!seen.has(pSlug)) {
            seen.add(pSlug);
            out.push({ name: r.province, slug: pSlug, province: r.province, landmarks: [] });
        }
        for (const d of r.districts) {
            if (d === 'Merkez') continue;
            const s = slugify(d);
            if (seen.has(s)) continue;
            seen.add(s);
            out.push({ name: d, slug: s, province: r.province, landmarks: [] });
        }
    }
    return out;
})();

// ——— Bölgeye özgü özel konsept çekim sayfaları ———
export const specialPages = [] as { slug: string; title: string; location: string; service: string; landmarks: string[] }[];

export const parseSlug = (slug: string) => {
    // 0. Özel konsept sayfaları (tam eşleşme) — diğer kontrollerden önce
    const special = specialPages.find((p) => p.slug === slug);
    if (special) {
        return { type: 'special', page: special };
    }

    // 1. Check District-Service combinations
    const districtIds = districts.map(d => slugify(d.name));
    for (const dId of districtIds) {
        if (slug.startsWith(dId)) {
            const potentialServiceId = slug.replace(`${dId}-`, '');
            const service = services.find(s => s.id === potentialServiceId);
            if (service) {
                return {
                    type: 'district-service',
                    district: districts.find(d => slugify(d.name) === dId),
                    service: service
                };
            }
        }
    }

    // 1.5. Çevre il/ilçe + hizmet kombinasyonları (gerçek landing page'ler)
    for (const loc of regionLocations) {
        if (slug.startsWith(`${loc.slug}-`)) {
            const potentialServiceId = slug.slice(loc.slug.length + 1);
            const service = services.find(s => s.id === potentialServiceId);
            if (service) {
                return {
                    type: 'district-service',
                    district: { id: loc.slug, name: loc.name, landmarks: loc.landmarks },
                    service: service,
                    region: loc.province
                };
            }
        }
    }

    // 2. Check Plateau-Query combinations (Link Multiplier)
    const plateauIds = plateaus.map(p => p.id);
    for (const pId of plateauIds) {
        if (slug.startsWith(pId)) {
            const potentialQueryId = slug.replace(`${pId}-`, '');
            const query = plateauQueries.find(q => q.id === potentialQueryId);
            if (query) {
                return {
                    type: 'plateau-query',
                    plateau: plateaus.find(p => p.id === pId),
                    query: query
                };
            }
        }
    }

    // 3. Check Base Plateau
    const plateau = plateaus.find(p => p.id === slug);
    if (plateau) return { type: 'plateau', plateau };

    return null;
};
