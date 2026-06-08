"use client"
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, doc, query, orderBy } from 'firebase/firestore'

export function useContent() {
    const [settings, setSettings] = useState({ 
        heroTitle: "En Özel Anları Yakalıyoruz,<br/>Sizin Hikayenizi Yazıyoruz", 
        heroSubtitle: "Profesyonel düğün fotoğrafçısı olarak, en mutlu gününüzü profesyonel kadromuz ve son teknoloji ekipmanlarımızla hikayeleştiriyoruz.",
        aboutTitle: "Mercekten Bakarak <br/> Aşkın Dünyasını Keşfedin",
        aboutDesc: "Her çiftin hikayesinin benzersiz olduğuna inanıyoruz. Duygularınızı en saf haliyle yakalamak ve yıllar sonra bile aynı heyecanla bakacağınız kareler yaratmak için buradayız.",
        stat1Value: "10+", stat1Label: "Yıllık Tecrübe",
        stat2Value: "450+", stat2Label: "Mutlu Çiftler",
        stat3Value: "900+", stat3Label: "Özel Çekim"
    })
    const [slides, setSlides] = useState<any[]>([
        { id: 'h1', image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920" },
        { id: 'h2', image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1920" }
    ])
    const [portfolio, setPortfolio] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([
        { id: 's1', title: "Düğün Hikayesi", description: "En mutlu gününüzü bir film tadında ölümsüzleştiriyoruz.", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600" },
        { id: 's2', title: "Dış Çekim", description: "Doğanın kalbinde size özel sanatsal kareler.", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600" }
    ])
    const [team, setTeam] = useState<any[]>([
        { id: 't1', name: "Suat", role: "Baş Fotoğrafçı", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600" },
        { id: 't2', name: "Caner", role: "Sinematograf", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600" }
    ])
    const [features, setFeatures] = useState<any[]>([
        { id: 'f1', title: "Profesyonel Işık", desc: "En doğal ve etkileyici sonuçlar.", icon: "Camera", isActive: true },
        { id: 'f2', title: "Sinematik Kayıt", desc: "4K kalitesinde film tadında anılar.", icon: "PenTool", isActive: false }
    ])
    const [extras, setExtras] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // General Settings (Hero, About, etc.)
        const unsubSettings = onSnapshot(doc(db, 'settings', 'home'), (doc) => {
            if (doc.exists()) {
                const data = doc.data()
                setSettings({
                    heroTitle: data.heroTitle || "",
                    heroSubtitle: data.heroSubtitle || "",
                    aboutTitle: data.aboutTitle || "",
                    aboutDesc: data.aboutDesc || "",
                    stat1Value: data.stat1Value || "10+",
                    stat1Label: data.stat1Label || "Yıllık Tecrübe",
                    stat2Value: data.stat2Value || "450+",
                    stat2Label: data.stat2Label || "Mutlu Çiftler",
                    stat3Value: data.stat3Value || "900+",
                    stat3Label: data.stat3Label || "Özel Çekim"
                })
            }
        })

        // Slides
        const unsubSlides = onSnapshot(collection(db, 'hero_slides'), (snap) => {
            setSlides(snap.docs.map(d => {
                const data = d.data();
                if (data.image) data.image = data.image.replace(/fotoğraflar/i, 'portfolio-photos');
                return { id: d.id, ...data };
            }))
        })

        // Portfolio
        const unsubPortfolio = onSnapshot(query(collection(db, 'portfolio'), orderBy('createdAt', 'desc')), (snap) => {
            setPortfolio(snap.docs.map(d => {
                const data = d.data();
                if (data.image) data.image = data.image.replace(/fotoğraflar/i, 'portfolio-photos');
                return { id: d.id, ...data };
            }))
        })

        // Services and Extras
        const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
            const allServices = snap.docs.map(d => {
                const data = d.data();
                if (data.image) data.image = data.image.replace(/fotoğraflar/i, 'portfolio-photos');
                return { id: d.id, ...data };
            })
            setServices(allServices.filter((s: any) => !s.isExtra))
            setExtras(allServices.filter((s: any) => s.isExtra))
        })

        // Team
        const unsubTeam = onSnapshot(collection(db, 'team'), (snap) => {
            setTeam(snap.docs.map(d => {
                const data = d.data();
                if (data.image) data.image = data.image.replace(/fotoğraflar/i, 'portfolio-photos');
                return { id: d.id, ...data };
            }))
        })

        // Features
        const unsubFeatures = onSnapshot(collection(db, 'features'), (snap) => {
            setFeatures(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        })

        // Mark loading as false once initial snapshots are done (approximately)
        const timeout = setTimeout(() => setLoading(false), 2000)

        return () => {
            clearTimeout(timeout)
            unsubSettings(); unsubSlides(); unsubPortfolio();
            unsubServices(); unsubTeam(); unsubFeatures();
        }
    }, [])

    return { settings, slides, portfolio, services, team, features, extras, loading }
}
