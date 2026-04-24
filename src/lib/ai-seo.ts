import { geminiModel } from "./gemini";
import cacheData from "@/data/seo-content-cache.json";

interface SeoContent {
    title: string;
    description: string;
    h1: string;
    content: string;
    faqs: { q: string, a: string }[];
}

const cache: Record<string, SeoContent> = cacheData;

// Semantic Matrix for High-Fidelity Variation
const variations = {
    hooks: [
        "{district} sokaklarında yankılanan o eşsiz aşk hikayesini, en sanatsal bakış açısıyla vizörümüze hapsediyoruz.",
        "Sivas'ın kalbinde, {district} ilçesinin doğal dokusunda unutulmaz bir {service} deneyimine hazır mısınız?",
        "Zamanı durdurmak imkansız olabilir ama {district}'ta o büyülü anları ölümsüzleştirmek bizim işimiz.",
        "Her deklanşör sesi, {district}'ta yeni bir başlangıcın ve sonsuz bir aşkın kanıtıdır.",
        "{district}'nın tarihi ve doğal güzellikleri altında, sizin hikayenizi bir sanat eserine dönüştürüyoruz."
    ],
    tech_vibe: [
        "**Sony A7R V**'nin 61 megapiksellik devasa çözünürlüğü ve **85mm G-Master** lensin yarattığı masalsı derinlik (bokeh) ile her detay kristal netliğinde.",
        "Çekimlerimizde en son teknoloji **Sony Alpha** serisi gövdeler ve **Carl Zeiss** optikler kullanarak, renklerin en doğal halini yakalıyoruz.",
        "Işıkla dans eden vizörümüz, **Sony'nin Yapay Zeka destekli netleme** teknolojisi sayesinde en hızlı anları bile kaçırmadan donduruyor.",
        "Sektör standartlarını belirleyen profesyonel ekipman parkurumuzla, {district} sakinlerine premium bir fotoğrafçılık deneyimi sunuyoruz."
    ],
    posing: [
        "Fotoğraf çekilmekten çekiniyor musunuz? Profesyonel **posing (pozlandırma)** rehberliğimizle, kendinizi bir model kadar rahat ve doğal hissedeceksiniz.",
        "Sizi asla zorlamıyor, en doğal halinizi yakalamak için fısıltıyla yönlendiriyoruz. O 'ilk bakış'taki heyecanınızı bozmadan kaydediyoruz.",
        "Sadece poz vermenizi istemiyoruz; o anı yaşamanızı sağlıyoruz. Biz sadece orada olan güzelliği en doğru ışıkla çerçeveliyoruz.",
        "Kamera karşısında 'donup kalma' devri kapandı. Uzman ekibimizle en rahat, en sempatik ve en estetik karelerinizi beraber çıkaracağız."
    ]
};

const getInformedFallback = (district: string, service: string, landmarks: string[]): SeoContent => {
    // Deterministic random selection based on district and service to ensure persistence
    const seed = district.length + service.length;
    const select = (arr: string[]) => arr[seed % arr.length];
    
    const landmarkStr = landmarks.length > 0 ? `**${landmarks.join(", ")}**` : district;
    
    const title = `${district} ${service} | Sivas'ın En İyi Fotoğrafçısı`;
    const description = `${district} genelinde profesyonel ${service}. Sony A7R V kalitesi ve DJI Mavic 3 Pro drone çekimi ile 20 günde albüm teslimatı.`;
    const h1 = `${district} ${service}`;

    let venueDescription = `${select(variations.hooks).replace("{district}", district).replace("{service}", service)} **Sivas Düğün Fotoğrafçısı** (@sivasdugunfotografcisi) kimliğimizle, ${district} sakinlerine sadece bir fotoğraf değil, bir miras bırakıyoruz.`;
    
    // Custom logic for Botanic Garden / Plateaus in fallback
    if (district.toLowerCase().includes('botanik') || district.toLowerCase().includes('garden')) {
        venueDescription = `**Sivas Botanik Garden Çekim Platosu**'nun her mevsim değişen büyülü atmosferinde, hikayenize sanatsal bir dokunuş katıyoruz. Yazın kavurucu sıcağında serinleyen dinlenme alanları, kışın ise kar ve yağmurdan etkilenmeyen konsept kapalı stüdyolarımızla çekimlerinize konforla devam ediyoruz.`;
    }

    const content = `
## Sivas'ta ${service}: Aşkın En Saf Hali

${venueDescription}

### Sanatsal Vizyon ve Teknoloji
${select(variations.tech_vibe).replace("{district}", district)} Çekim lokasyonlarımızı belirlerken ${landmarkStr} gibi noktaların ışık açısını ve mevsimsel dokusunu ezbere biliyoruz. 

### Sivas'ta Özel Dokunuşlar
${select(variations.posing).replace("{district}", district)} Sivas'ın her metrekaresinde, sizin heyecanınızı ve mutluluğunuzu dondurarak gelecek nesillere birer şaheser teslim etmek tek gayemiz.

---

**Neden Sivas Düğün Fotoğrafçısı?**
*   **Dört Mevsim Konfor:** Botanik Garden'ın hem açık hem kapalı alanları sayesinde her hava koşulunda kesintisiz çekim.
*   **Sony A7R V Gücü:** Her karede kristal netliği ve 61MP devasa detay derinliği.
*   **20 Gün Teslim:** İş akışımızı en kaliteli şekilde yönetiyor ve albümlerinizi 20 gün içinde teslim ediyoruz.
*   **Kişiye Özel Edit:** Standart filtreler değil, her fotoğrafa özel renk ve ışık terbiyesi uyguluyoruz.

📞 **Hemen İletişime Geçin:** [0532 407 1563](tel:05324071563)
`;

    const faqs = [
        { q: `${district}'ta hangi lokasyonları önerirsiniz?`, a: `${district} çevresindeki ${landmarks[0] || "doğal alanlar"} ve ışığın en güzel olduğu noktaları konsepte göre size özel listeliyoruz.` },
        { q: "Albüm teslim süresi nedir?", a: "Tüm düzenlemeler ve baskı süreci dahil olmak üzere en geç 20 gün içinde ürünlerinizi kapınıza teslim ediyoruz." },
        { q: "Hava durumu olumsuz olursa?", a: "Botanik Garden çekim platosu hem açık hem de kapalı alan konseptlerine sahip olduğu için yağmur, kar veya rüzgar gibi olumsuz hava şartlarında çekimlerimiz kesintisiz ve konforlu bir şekilde devam etmektedir." }
    ];

    return { title, description, h1, content, faqs };
};

export const generateSeoContent = async (district: string, service: string, landmarks: string[], targetType?: string): Promise<SeoContent | null> => {
    const slug = `${district.toLowerCase()}-${service.toLowerCase()}`.replace(/\s+/g, '-');
    
    // 1. Check persistent cache first
    if (cache[slug]) {
        return cache[slug];
    }

    // 2. Try Gemini if API key exists
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
        try {
            let contextPrompt = `Aktif bir SEO uzmanı ve fotoğrafçı olarak ${district} ilçesinde ${service} hizmeti için 600 kelimelik, ikna edici ve EŞSİZ bir makale yaz.`;
            
            if (targetType === 'plateau-query' || targetType === 'plateau') {
                contextPrompt = `Bir çekim platosu olan ${district} (Botanik Garden vb.) hakkında ${service} odaklı bir makale yaz. 
                Vurgulaman gerekenler:
                - Markamız: **Sivas Düğün Fotoğrafçısı** (@sivasdugunfotografcisi).
                - Mekan Avantajları: Yazın sıcağından koruyan serin alanlar, kışın ise yağmur, kar ve çamurdan etkilenmeden çekim yapmayı sağlayan modern kapalı konseptler. 
                - Sivas'ta (Sivas'ta yaz, Sivas'da yanlış!) dört mevsim çekim konforu.
                - Mekanın güzelliği ama 'Mekan Fotoğrafçıları' ile bizim gibi 'Bağımsız Profesyonel Ekipler' arasındaki kalite farkı.
                - Bağımsız bir ekiple çalışmanın sanatsal özgürlük, en üst segment ekipman (Sony A7R V) ve kişiye özel ilgi sağladığı.
                - Mekanların kendi ekiplerinin genelde 'hızlı tüketim' (fabrika çıkışı) odaklı olduğunu, bizim ise her kareyi bir sanat eseri gibi işlediğimizi belirt.
                - Müşteriye şu mesajı ver: 'Kendi fotoğrafçınızı getirme hakkınızı kullanın, kalitenizi şansa bırakmayın.'
                - FAQ Sorusuna Cevap: Hava durumu olumsuz olsa bile Botanik Garden'da çekim kesintisiz devam eder çünkü hem açık hem kapalı konseptler mevcuttur.
                - HUKUKİ GÜVENLİK: Hakaret etme, sadece profesyonel kıyaslama yap.`;
            }

            if (service.toLowerCase().includes('fiyat') || service.toLowerCase().includes('ucret') || service.toLowerCase().includes('paket')) {
                contextPrompt += `\nFiyatların neden bir 'yatırım' olduğunu, Sony A7R V ve DJI Mavic 3 Pro gibi ekipmanların yarattığı devasa kalite farkını anlat. 20 gün teslimat garantisini öne çıkar.`;
            }

            const prompt = `${contextPrompt}
            JSON formatında dön: {title, description, h1, content, faqs: [{q, a}]}. 
            Dil: Türkçe.`;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed;
            }
        } catch (e) {
            console.error("Gemini failed, using semantic fallback.");
        }
    }

    // 3. Fallback to High-Fidelity Semantic Matrix
    return getInformedFallback(district, service, landmarks);
};
