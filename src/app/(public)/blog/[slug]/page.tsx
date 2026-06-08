import React from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

async function getPost(slug: string) {
    const q = query(collection(db, 'blog_posts'), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post: any = await getPost(params.slug);

    if (!post) notFound();

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[70vh] w-full overflow-hidden bg-black">
                <img 
                    src={post.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1920'} 
                    alt={post.title}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute inset-0 flex items-end pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="flex flex-col gap-6">
                            <Link href="/blog" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Geri Dön
                            </Link>
                            <h1 className="text-4xl md:text-6xl font-serif text-white font-black leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/60 font-black">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#D49A73]" />
                                    {format(new Date(post.date), 'd MMMM yyyy', { locale: tr })}
                                </span>
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#D49A73]" />
                                    {post.author || 'Sivas Düğün Fotoğrafçısı'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#D49A73]" />
                                    6 Dakika Okuma
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto">
                    {/* Excerpt */}
                    <p className="text-xl md:text-2xl font-serif italic text-gray-500 mb-12 border-l-4 border-[#D49A73] pl-8 leading-relaxed">
                        {post.excerpt}
                    </p>

                    {/* Markdown Content */}
                    <div className="prose prose-lg prose-stone max-w-none 
                        prose-headings:font-serif prose-headings:font-bold prose-headings:text-black
                        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                        prose-li:text-gray-600
                        prose-strong:text-black prose-strong:font-black
                        prose-img:rounded-3xl prose-img:shadow-2xl
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-10 border-t border-black/5 flex flex-col items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#FFF9E5] text-[#D49A73] rounded-full flex items-center justify-center font-serif font-black text-2xl border border-[#D49A73]/20">
                                S
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#D49A73]">Yazarlar</span>
                                <span className="text-lg font-serif italic text-black font-semibold">Sivas Düğün Fotoğrafçısı Editör Masası</span>
                            </div>
                        </div>
                        <Link 
                            href="/online-rezervasyon" 
                            className="bg-black text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#D49A73] transition-all shadow-xl shadow-black/10 active:scale-95"
                        >
                            Hayalinizi Bizimle Planlayın
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
