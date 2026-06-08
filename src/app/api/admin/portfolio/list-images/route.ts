import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { verifyAdmin } from '@/lib/auth-server'

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) {
        return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 })
    }

    try {
        const importDir = path.join(process.cwd(), 'public', 'fotoğraflar')
        
        if (!fs.existsSync(importDir)) {
            return NextResponse.json({ success: false, error: 'Klasör bulunamadı: public/fotoğraflar' }, { status: 404 })
        }

        const files = fs.readdirSync(importDir)
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
        ).map(file => ({
            name: file,
            title: file.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
            url: `/fotoğraflar/${file}`
        }))

        return NextResponse.json({ 
            success: true, 
            images: imageFiles 
        })
    } catch (error: any) {
        console.error('List images error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
