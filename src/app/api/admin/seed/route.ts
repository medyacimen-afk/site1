import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'

export async function GET() {
    console.log("Seed başlatıldı...");
    try {
        // 1. Hero & About Settings
        console.log("Settings yükleniyor...");
        await setDoc(doc(db, 'settings', 'home'), {
            heroTitle: "En Özel Anları Yakalıyoruz,<br/>Sizin Hikayenizi Yazıyoruz",
            heroSubtitle: "Sivas'ın en çok tercih edilen düğün fotoğrafçısı olarak, en mutlu gününüzü profesyonel kadromuz ve son teknoloji ekipmanlarımızla hikayeleştiriyoruz.",
            aboutTitle: "Mercekten Bakarak <br/> Aşkın Dünyasını Keşfedin",
            aboutDesc: "Sivas Düğün Fotoğrafçısı olarak, her çiftin hikayesinin benzersiz olduğuna inanıyoruz. Duygularınızı en saf haliyle yakalamak ve yıllar sonra bile aynı heyecanla bakacağınız kareler yaratmak için buradayız."
        }, { merge: true })

        // 2. Clear and Seed Hero Slides
        console.log("Hero slides yükleniyor...");
        const slidesSnap = await getDocs(collection(db, 'hero_slides'))
        for (const d of slidesSnap.docs) {
            await deleteDoc(doc(db, 'hero_slides', d.id))
        }
        
        const slides = [
            { image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920", createdAt: new Date().toISOString() },
            { image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1920", createdAt: new Date().toISOString() },
            { image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1920", createdAt: new Date().toISOString() }
        ]
        for (const s of slides) await addDoc(collection(db, 'hero_slides'), s)

        // 3. Clear and Seed Services
        console.log("Hizmetler yükleniyor...");
        const servicesSnap = await getDocs(collection(db, 'services'))
        for (const d of servicesSnap.docs) {
            await deleteDoc(doc(db, 'services', d.id))
        }

        const services = [
            { title: "Düğün Hikayesi", description: "Tüm gününüzü bir film tadında, en ince detayına kadar kaydediyoruz.", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200" },
            { title: "Dış Çekim & Save The Date", description: "Doğanın içinde, size en uygun mekanda sanatsal kareler.", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200" },
            { title: "Nişan & Sünnet", description: "Özel davetlerinizi ve organizasyonlarınızı ölümsüzleştiriyoruz.", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200" }
        ]
        for (const s of services) await addDoc(collection(db, 'services'), s)

        // 4. Clear and Seed Features
        console.log("Özellikler yükleniyor...");
        const featuresSnap = await getDocs(collection(db, 'features'))
        for (const d of featuresSnap.docs) {
            await deleteDoc(doc(db, 'features', d.id))
        }

        const features = [
            { title: "Profesyonel Işık", desc: "En doğal ve etkileyici sonuçlar için özel ışık teknikleri kullanıyoruz.", icon: "Camera", isActive: true },
            { title: "4K Video Kaydı", desc: "Anılarınızı en yüksek çözünürlükte, sinematik kalitede saklıyoruz.", icon: "PenTool", isActive: false },
            { title: "Özel Albüm Tasarımı", desc: "Size özel, el yapımı ve kaliteli albüm seçenekleri sunuyoruz.", icon: "Heart", isActive: false }
        ]
        for (const f of features) await addDoc(collection(db, 'features'), f)

        // 5. Clear and Seed Team
        console.log("Ekip yükleniyor...");
        const teamSnap = await getDocs(collection(db, 'team'))
        for (const d of teamSnap.docs) {
            await deleteDoc(doc(db, 'team', d.id))
        }

        const team = [
            { name: "Suat", role: "Baş Fotoğrafçı", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600" },
            { name: "Caner", role: "Sinematograf", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600" }
        ]
        for (const t of team) await addDoc(collection(db, 'team'), t)

        console.log("Seed tamamlandı!");
        return NextResponse.json({ success: true, message: "Tüm veriler başarıyla kurtarıldı!" })
    } catch (error: any) {
        console.error("Seed hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
