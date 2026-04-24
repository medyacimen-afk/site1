import { NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const { topic, tone } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Lütfen bir konu başlığı girin." }, { status: 400 });
        }

        const blogData = await generateBlogContent(topic, tone);
        
        return NextResponse.json(blogData);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ 
            error: error.message || "İçerik üretilirken bir hata oluştu. API anahtarını kontrol edin." 
        }, { status: 500 });
    }
}
