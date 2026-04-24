"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useContent } from '@/hooks/useContent'
import { Loader2 } from 'lucide-react'

const categories = ["Hepsi", "Düğün Hikayesi", "Nişan & Sünnet", "Gelin Alma", "Save the Date", "Plato Çekimleri", "Evlilik Teklifi"]

export default function PortfolioPage() {
    const { portfolio, loading } = useContent()
    const [activeCategory, setActiveCategory] = useState("Hepsi")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )

    const filteredItems = activeCategory === "Hepsi" 
        ? portfolio 
        : portfolio.filter(item => item.category === activeCategory)

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
        setCurrentPage(1)
    }

    return (
        <main className="min-h-screen bg-white pt-40 pb-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-foreground/40 tracking-[0.4em] uppercase text-[10px] mb-4"
                    >
                        Portfolyomuz
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif text-foreground mb-12 tracking-tight"
                    >
                        Ölümsüz <span className="italic">Kareler</span>
                    </motion.h1>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={activeCategory === category ? "default" : "outline"}
                                onClick={() => handleCategoryChange(category)}
                                className={`rounded-none h-12 px-8 transition-all ${
                                    activeCategory === category 
                                        ? "bg-primary text-primary-foreground hover:bg-primary shadow-lg shadow-primary/20" 
                                        : "border-black/10 text-foreground/70 hover:bg-slate-50"
                                }`}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <motion.div 
                    layout
                    className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.6 }}
                                className="group relative overflow-hidden break-inside-avoid shadow-xl shadow-black/5"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-white/60 tracking-[0.2em] uppercase text-[10px] mb-2 block">{item.category}</span>
                                    <h3 className="text-white text-xl font-serif italic tracking-wide">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-16 gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-none border-black/10"
                        >
                            Önceki
                        </Button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <Button
                                    key={i}
                                    variant={currentPage === i + 1 ? "default" : "outline"}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 p-0 rounded-none ${
                                        currentPage === i + 1 
                                        ? "bg-primary text-primary-foreground" 
                                        : "border-black/10 text-foreground/70"
                                    }`}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-none border-black/10"
                        >
                            Sonraki
                        </Button>
                    </div>
                )}
            </div>
        </main>
    )
}
