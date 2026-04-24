"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

export default function VideosPage() {
    const [videos, setVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'))
            const snap = await getDocs(q)
            setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-24">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary tracking-[0.3em] uppercase text-[10px] mb-4 font-bold"
                    >
                        SİNE-VİZYON
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 font-bold"
                    >
                        Düğün <span className="italic text-primary">Klipleri</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-12 h-[2px] bg-primary/30"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white rounded-[2rem] border border-black/5 p-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500"
                            >
                                <div className="aspect-video bg-black rounded-[1.5rem] overflow-hidden relative shadow-inner">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={`https://www.youtube.com/embed/${video.youtubeId}`} 
                                        title={video.title} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 line-clamp-1">{video.title}</h3>
                                    <PlayCircle className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
                                </div>
                            </motion.div>
                        ))}
                        {videos.length === 0 && (
                            <div className="col-span-full py-32 text-center text-slate-400 italic">
                                Henüz video klip eklenmemiş.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}
