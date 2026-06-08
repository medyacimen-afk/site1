import { NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/gemini';
import { verifyAdmin } from '@/lib/auth-server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { topic, tone } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Lütfen bir konu başlığı girin." }, { status: 400 });
        }

        // Gemini API key: önce Firestore'dan oku, yoksa env var
        let geminiApiKey: string | undefined;
        try {
            if (adminDb) {
                const apiSnap = await adminDb.collection('settings').doc('api').get();
                if (apiSnap.exists) {
                    geminiApiKey = apiSnap.data()?.geminiApiKey || undefined;
                }
            }
        } catch {
            // Firestore hatası → env var'a düş
        }

        const blogData = await generateBlogContent(topic, tone, geminiApiKey);

        return NextResponse.json(blogData);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({
            error: error.message || "İçerik üretilirken bir hata oluştu. API anahtarını kontrol edin."
        }, { status: 500 });
    }
}
