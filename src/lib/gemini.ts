import { GoogleGenerativeAI } from "@google/generative-ai";

// Sunucu tarafı — API key env'den veya Firestore'dan (dinamik) gelir
const envApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

/**
 * Dinamik API key ile Gemini modeli döner.
 * Önce parametre → sonra env var kullanılır.
 */
export function getGeminiModel(dynamicKey?: string) {
    const key = dynamicKey || envApiKey;
    if (!key) throw new Error("Gemini API anahtarı bulunamadı. Admin paneli → Ayarlar → Yapay Zeka bölümünden ekleyin.");
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.7, topP: 0.8, topK: 40 },
    });
}

// Geriye dönük uyum — eski kodlar kırılmasın
export const geminiModel = envApiKey ? new GoogleGenerativeAI(envApiKey).getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.7, topP: 0.8, topK: 40 },
}) : null;

export const generateBlogContent = async (topic: string, tone: string = "professional & emotional", apiKey?: string) => {
    const key = apiKey || envApiKey;
    if (!key) throw new Error("Gemini API anahtarı bulunamadı. Admin paneli → Ayarlar → Yapay Zeka bölümünden ekleyin.");

    const prompt = `
        Sen \"Profesyonel Düğün Fotoğrafçısı\" markasının yetenekli blog yazarı ve SEO uzmanısın.
        Konu: "${topic}"
        Ton: "${tone}"
        Dil: Türkçe

        Bu konu hakkında kapsamlı, SEO uyumlu, ilgi çekici ve premium bir blog yazısı yaz. 
        Yazı şu bölümlerden oluşmalı:
        1. İlgi çekici, SEO uyumlu bir başlık.
        2. Kısa ve merak uyandırıcı bir giriş paragrafı (excerpt).
        3. Alt başlıklar kullanarak detaylı içerik.
        4. Çiftler için 3-4 adet altın değerinde tavsiye.
        5. Markamızın kalitesini vurgulayan ve iletişim bilgilerine (veya online rezervasyon sistemine) yönlendiren güçlü bir kapanış.

        ÖNEMLİ: Çıktıyı mutlaka JSON formatında şu anahtarlarla ver:
        {
            "title": "...",
            "excerpt": "...",
            "content": "Markdown formatında tüm gövde metni buraya..."
        }
        Cevap sadece JSON olsun, başka metin ekleme.
    `;

    try {
        const model = getGeminiModel(key);
        const result = await model.generateContent(prompt);
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
