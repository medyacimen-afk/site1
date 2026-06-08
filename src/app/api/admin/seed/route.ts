import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { verifyAdmin } from '@/lib/auth-server'

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) {
        return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 })
    }

    try {
        // Hero & Genel Ayarlar
        await setDoc(doc(db, 'settings', 'home'), {
            heroTitle: "En Özel Anları Yakalıyoruz,<br/>Sizin Hikayenizi Yazıyoruz",
            heroSubtitle: "Profesyonel düğün fotoğrafçısı olarak en mutlu gününüzü ölümsüzleştiriyoruz.",
            aboutTitle: "Mercekten Bakarak <br/> Aşkın Dünyasını Keşfedin",
            aboutDesc: "Her çiftin hikayesinin benzersiz olduğuna inanıyoruz. Duygularınızı en saf haliyle yakalamak için buradayız.",
            stat1Value: "10+", stat1Label: "Yıllık Tecrübe",
            stat2Value: "500+", stat2Label: "Mutlu Çift",
            stat3Value: "1000+", stat3Label: "Özel Çekim"
        }, { merge: true })

        // Hero Slaytlar
        const slidesSnap = await getDocs(collection(db, 'hero_slides'))
        for (const d of slidesSnap.docs) await deleteDoc(doc(db, 'hero_slides', d.id))
        const slides = [
            { image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920", createdAt: new Date().toISOString() },
            { image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1920", createdAt: new Date().toISOString() },
            { image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1920", createdAt: new Date().toISOString() }
        ]
        for (const s of slides) await addDoc(collection(db, 'hero_slides'), s)

        // Hizmetler
        const servicesSnap = await getDocs(collection(db, 'services'))
        for (const d of servicesSnap.docs) await deleteDoc(doc(db, 'services', d.id))
        const services = [
            { title: "Düğün Hikayesi", description: "Tüm gününüzü bir film tadında kaydediyoruz.", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200", price: 0 },
            { title: "Dış Çekim & Save The Date", description: "Doğanın içinde size özel sanatsal kareler.", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200", price: 0 },
            { title: "Nişan & Sünnet", description: "Özel organizasyonlarınızı ölümsüzleştiriyoruz.", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200", price: 0 }
        ]
        for (const s of services) await addDoc(collection(db, 'services'), s)

        // Özellikler
        const featuresSnap = await getDocs(collection(db, 'features'))
        for (const d of featuresSnap.docs) await deleteDoc(doc(db, 'features', d.id))
        const features = [
            { title: "Profesyonel Ekipman", desc: "En kaliteli ekipmanlarla en iyi sonuçlar.", icon: "Camera", isActive: true },
            { title: "4K Video Kaydı", desc: "Sinematik kalitede anılar.", icon: "PenTool", isActive: true },
            { title: "Hızlı Teslimat", desc: "Kısa sürede albüm ve dijital teslim.", icon: "Heart", isActive: true }
        ]
        for (const f of features) await addDoc(collection(db, 'features'), f)

        // Ekip
        const teamSnap = await getDocs(collection(db, 'team'))
        for (const d of teamSnap.docs) await deleteDoc(doc(db, 'team', d.id))
        const team = [
            { name: "Fotoğrafçı", role: "Baş Fotoğrafçı", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600" },
        ]
        for (const t of team) await addDoc(collection(db, 'team'), t)

        return NextResponse.json({ success: true, message: "Demo veriler yüklendi." })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
