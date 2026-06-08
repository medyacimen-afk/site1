"use client"
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

export interface SiteSettings {
    // Kimlik
    businessName: string
    tagline: string
    about: string
    logoUrl: string

    // İletişim
    phone: string
    whatsapp: string   // sadece rakamlar, başında ülke kodu: 905xxxxxxxxx
    email: string
    address: string
    city: string

    // Sosyal Medya (sadece kullanıcı adı, link değil)
    instagram: string
    facebook: string
    youtube: string    // @ ile: @kullaniciadi
}

// Yeni kurulum için varsayılan boş değerler
const DEFAULTS: SiteSettings = {
    businessName: 'Fotoğrafçı Adı',
    tagline: 'Profesyonel fotoğraf hizmetleri',
    about: 'En özel anlarınızı ölümsüzleştiriyoruz.',
    logoUrl: '/logo.webp',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    instagram: '',
    facebook: '',
    youtube: '',
}

/**
 * Site kimlik bilgilerini Firebase settings/site dökümanından okur.
 * Tüm client component'lar bu hook'u kullanır.
 * Admin panel → Ayarlar → Site Bilgileri'nden yönetilir.
 */
export function useSiteSettings() {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULTS)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
            if (snap.exists()) {
                setSiteSettings({ ...DEFAULTS, ...snap.data() as Partial<SiteSettings> })
            }
            setLoading(false)
        }, () => {
            // Hata durumunda varsayılanlarla devam et
            setLoading(false)
        })
        return () => unsub()
    }, [])

    // Yardımcı — tam URL oluşturucular
    const links = {
        instagram: siteSettings.instagram
            ? `https://instagram.com/${siteSettings.instagram}`
            : '#',
        facebook: siteSettings.facebook
            ? `https://facebook.com/${siteSettings.facebook}`
            : '#',
        youtube: siteSettings.youtube
            ? `https://youtube.com/${siteSettings.youtube}`
            : '#',
        whatsapp: siteSettings.whatsapp
            ? `https://wa.me/${siteSettings.whatsapp}`
            : '#',
        phone: siteSettings.phone
            ? `tel:+${siteSettings.phone.replace(/\D/g, '')}`
            : '#',
        email: siteSettings.email
            ? `mailto:${siteSettings.email}`
            : '#',
    }

    return { siteSettings, links, loading }
}
