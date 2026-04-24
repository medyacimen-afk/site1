import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
    }
});

export const generateBlogContent = async (topic: string, tone: string = "professional & emotional") => {
    if (!apiKey) throw new Error("GEMINI_API_KEY bulunamadı. Lütfen .env.local dosyasına ekleyin.");

    const prompt = `
        Sen Sivas Düğün Fotoğrafçısı (Duru Foto Film) markasının profesyonel blog yazarı ve SEO uzmanısın.
        Konu: "${topic}"
        Ton: "${tone}"
        Dil: Türkçe

        Bu konu hakkında kapsamlı, SEO uyumlu, ilgi çekici ve premium bir blog yazısı yaz. 
        Yazı şu bölümlerden oluşmalı:
        1. İlgi çekici, SEO uyumlu bir başlık.
        2. Kısa ve merak uyandırıcı bir giriş paragrafı (excerpt).
        3. Alt başlıklar kullanarak detaylı içerik.
        4. Çiftler için 3-4 adet altın değerinde tavsiye.
        5. Markamızın (Duru Foto Film) Sivas'taki kalitesini vurgulayan bir kapanış.

        ÖNEMLİ: Çıktıyı mutlaka JSON formatında şu anahtarlarla ver:
        {
            "title": "...",
            "excerpt": "...",
            "content": "Markdown formatında tüm gövde metni buraya..."
        }
        Cevap sadece JSON olsun, başka metin ekleme.
    `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Extract JSON (sometimes AI adds markdown blocks ```json)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Geçerli bir JSON çıktısı alınamadı.");
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};
