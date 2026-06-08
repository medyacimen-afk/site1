"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContent } from '@/hooks/useContent'
import { Loader2, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'

const categories = ["Hepsi", "Düğün Hikayesi", "Nişan & Sünnet", "Gelin Alma", "Save the Date", "Plato Çekimleri", "Evlilik Teklifi"]

export default function PortfolioPage() {
    const { portfolio, loading } = useContent()
    const [activeCategory, setActiveCategory] = useState("Hepsi")
    const [currentPage, setCurrentPage] = useState(1)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [loadedIds, setLoadedIds] = useState<Record<string, boolean>>({})
    const itemsPerPage = 12

    const filteredItems = useMemo(() => (
        activeCategory === "Hepsi"
            ? portfolio
            : portfolio.filter((item: any) => item.category === activeCategory)
    ), [portfolio, activeCategory])

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
        setCurrentPage(1)
    }

    const countFor = (category: string) =>
        category === "Hepsi" ? portfolio.length : portfolio.filter((i: any) => i.category === category).length

    // ——— Lightbox gezinme ———
    const closeLightbox = useCallback(() => setLightboxIndex(null), [])
    const showNext = useCallback(() => {
        setLightboxIndex((i) => (i === null ? i : (i + 1) % filteredItems.length))
    }, [filteredItems.length])
    const showPrev = useCallback(() => {
        setLightboxIndex((i) => (i === null ? i : (i - 1 + filteredItems.length) % filteredItems.length))
    }, [filteredItems.length])

    useEffect(() => {
        if (lightboxIndex === null) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox()
            else if (e.key === 'ArrowRight') showNext()
            else if (e.key === 'ArrowLeft') showPrev()
        }
        window.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [lightboxIndex, closeLightbox, showNext, showPrev])

    const openItem = (item: any) => {
        const idx = filteredItems.findIndex((f: any) => f.id === item.id)
        if (idx >= 0) setLightboxIndex(idx)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )

    const activeImage = lightboxIndex !== null ? filteredItems[lightboxIndex] : null

    return (
        <main className="min-h-screen bg-gradient-to-b from-white via-[#FBFAF8] to-white pt-40 pb-28">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-14">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary/70 tracking-[0.4em] uppercase text-[11px] mb-4 font-semibold"
                    >
                        Portfolyomuz
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif text-foreground mb-4 tracking-tight"
                    >
                        Ölümsüz <span className="italic text-primary">Kareler</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-foreground/50 max-w-xl text-sm md:text-base leading-relaxed mb-12"
                    >
                        Her kare, anların sanata dönüştüğü bir hikâye. Aşağıdaki çalışmalardan bir kareye dokunarak tam ekran inceleyebilirsiniz.
                    </motion.p>

                    {/* Filter Buttons — pill */}
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {categories.map((category) => {
                            const active = activeCategory === category
                            const count = countFor(category)
                            return (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`group inline-flex items-center gap-2 rounded-full px-5 h-11 text-sm font-semibold transition-all duration-300 ${
                                        active
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : "bg-white border border-black/10 text-foreground/70 hover:border-primary/40 hover:text-primary"
                                    }`}
                                >
                                    {category}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                                        active ? "bg-white/25 text-white" : "bg-black/5 text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary"
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Gallery Grid (masonry) */}
                {paginatedItems.length === 0 ? (
                    <div className="text-center py-32 text-foreground/40 italic">
                        Bu kategoride henüz çalışma eklenmemiş.
                    </div>
                ) : (
                    <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
                        <AnimatePresence mode="popLayout">
                            {paginatedItems.map((item: any) => (
                                <motion.button
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    transition={{ duration: 0.5 }}
                                    onClick={() => openItem(item)}
                                    className="group relative block w-full overflow-hidden rounded-2xl break-inside-avoid mb-6 shadow-md shadow-black/5 ring-1 ring-black/[0.04] focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                                >
                                    {/* Skeleton */}
                                    {!loadedIds[item.id] && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                                    )}
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        onLoad={() => setLoadedIds((p) => ({ ...p, [item.id]: true }))}
                                        className={`w-full h-auto object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.07] ${loadedIds[item.id] ? 'opacity-100' : 'opacity-0'}`}
                                    />

                                    {/* Kalıcı hafif gradyan */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                                    {/* Kategori çipi */}
                                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/85 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-foreground/70 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                                        {item.category}
                                    </span>

                                    {/* Büyüteç ikonu */}
                                    <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-foreground/70 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400">
                                        <Expand className="w-4 h-4" />
                                    </span>

                                    {/* Başlık */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-white text-lg md:text-xl font-serif italic tracking-wide drop-shadow">{item.title}</h3>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-16 gap-2">
                        <button
                            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                            disabled={currentPage === 1}
                            className="h-10 px-5 rounded-full border border-black/10 text-sm font-semibold text-foreground/70 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-black/10 disabled:hover:text-foreground/70 transition-all"
                        >
                            Önceki
                        </button>
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                        currentPage === i + 1
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                            : "border border-black/10 text-foreground/60 hover:border-primary/40 hover:text-primary"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                            disabled={currentPage === totalPages}
                            className="h-10 px-5 rounded-full border border-black/10 text-sm font-semibold text-foreground/70 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-black/10 disabled:hover:text-foreground/70 transition-all"
                        >
                            Sonraki
                        </button>
                    </div>
                )}
            </div>

            {/* ——— Lightbox ——— */}
            <AnimatePresence>
                {activeImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
                        onClick={closeLightbox}
                    >
                        {/* Kapat */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                            aria-label="Kapat"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Sayaç */}
                        <span className="absolute top-7 left-1/2 -translate-x-1/2 text-white/70 text-xs font-semibold tracking-widest">
                            {lightboxIndex! + 1} / {filteredItems.length}
                        </span>

                        {/* Önceki */}
                        {filteredItems.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); showPrev() }}
                                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                                aria-label="Önceki"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Görsel */}
                        <motion.div
                            key={activeImage.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={activeImage.image}
                                alt={activeImage.title}
                                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
                            />
                            <div className="mt-4 text-center">
                                <span className="text-primary/80 tracking-[0.25em] uppercase text-[10px] font-semibold block mb-1">{activeImage.category}</span>
                                <h3 className="text-white text-xl font-serif italic">{activeImage.title}</h3>
                            </div>
                        </motion.div>

                        {/* Sonraki */}
                        {filteredItems.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); showNext() }}
                                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                                aria-label="Sonraki"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
