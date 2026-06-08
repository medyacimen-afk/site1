import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
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
            return NextResponse.json({ success: false, error: 'Import directory not found' }, { status: 404 })
        }

        const files = fs.readdirSync(importDir)
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
        )

        console.log(`${imageFiles.length} adet fotoğraf bulundu. Aktarım başlıyor...`)

        let count = 0
        for (const file of imageFiles) {
            // URL in public folder: /portfolio-import/filename
            const url = `/fotoğraflar/${file}`
            const title = file.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' ')
            
            await addDoc(collection(db, 'portfolio'), {
                title: title.charAt(0).toUpperCase() + title.slice(1),
                category: 'Düğün', // Default category
                image: url,
                isHome: false,
                createdAt: new Date().toISOString()
            })
            count++
        }

        return NextResponse.json({ 
            success: true, 
            message: `${count} adet fotoğraf başarıyla Firestore'a eklendi.` 
        })
    } catch (error: any) {
        console.error('Bulk import error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
