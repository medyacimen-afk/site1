"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon, Camera, Clock, User, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'

const steps = [
    { title: "Tarih Seçimi", icon: <CalendarIcon className="w-5 h-5" /> },
    { title: "Hizmet Türü", icon: <Camera className="w-5 h-5" /> },
    { title: "İletişim", icon: <User className="w-5 h-5" /> },
    { title: "Onay", icon: <CheckCircle2 className="w-5 h-5" /> }
]

const services = ["Düğün Hikayesi", "Dış Çekim & Klip", "Nişan Çekimi", "Sünnet Fotoğrafları", "Stüdyo Çekimi"]

export default function ReservationPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        date: "",
        service: "",
        brideName: "",
        groomName: "",
        phone: "",
        email: ""
    })

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

    const renderStep = () => {
        switch(currentStep) {
            case 0:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-serif text-foreground mb-8">Ne Zaman Evleniyorsunuz?</h2>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-foreground/40 block ml-4">Tarih Seçin</label>
                            <Input 
                                type="date" 
                                className="h-16 bg-slate-50 border-black/5 rounded-full px-8 text-foreground focus:border-primary transition-all"
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                    </motion.div>
                )
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-serif text-white mb-8">Hangi Hizmeti İstiyorsunuz?</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {services.map((service) => (
                                <button
                                    key={service}
                                    onClick={() => setFormData({...formData, service})}
                                    className={`h-16 px-8 rounded-full border text-left transition-all flex items-center justify-between ${
                                        formData.service === service 
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                            : "bg-slate-50 text-foreground/60 border-black/5 hover:border-primary/30"
                                    }`}
                                >
                                    <span className="font-medium">{service}</span>
                                    {formData.service === service && <CheckCircle2 className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-serif text-white mb-8">Size Nasıl Ulaşalım?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                placeholder="Gelin Adı" 
                                className="h-16 bg-slate-50 border-black/5 rounded-full px-8 text-foreground focus:border-primary transition-all"
                                onChange={(e) => setFormData({...formData, brideName: e.target.value})}
                            />
                            <Input 
                                placeholder="Damat Adı" 
                                className="h-16 bg-slate-50 border-black/5 rounded-full px-8 text-foreground focus:border-primary transition-all"
                                onChange={(e) => setFormData({...formData, groomName: e.target.value})}
                            />
                        </div>
                            <Input 
                                placeholder="Telefon Numarası" 
                                className="h-16 bg-slate-50 border-black/5 rounded-full px-8 text-foreground focus:border-primary transition-all"
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                            <Input 
                                placeholder="E-Posta Adresi" 
                                className="h-16 bg-slate-50 border-black/5 rounded-full px-8 text-foreground focus:border-primary transition-all"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                    </motion.div>
                )
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-10"
                    >
                        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-serif text-foreground">Harika! Talebiniz Alındı</h2>
                        <p className="text-foreground/50 max-w-sm mx-auto font-light">
                            {formData.brideName} & {formData.groomName}, en kısa sürede size geri dönüş yapacağız. Tarihimiz: {formData.date}
                        </p>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-black/5 text-left max-w-sm mx-auto">
                            <div className="flex justify-between mb-2">
                                <span className="text-foreground/40 text-xs">Hizmet:</span>
                                <span className="text-foreground text-xs">{formData.service}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-foreground/40 text-xs">Tarih:</span>
                                <span className="text-foreground text-xs">{formData.date}</span>
                            </div>
                        </div>
                        <Button className="rounded-full h-14 px-12 bg-white text-black hover:bg-zinc-200">
                            Ana Sayfaya Dön
                        </Button>
                    </motion.div>
                )
            default:
                return null
        }
    }

    return (
        <main className="min-h-screen bg-white pt-40 pb-24">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Progress Tracker */}
                <div className="flex justify-between mb-16 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/5 -z-10 -translate-y-1/2" />
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center gap-4">
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
                                index <= currentStep 
                                    ? "bg-primary border-primary text-white shadow-2xl shadow-primary/20" 
                                    : "bg-slate-50 border-black/5 text-foreground/30"
                            }`}>
                                {step.icon}
                            </div>
                            <span className={`text-[10px] uppercase tracking-widest ${
                                index <= currentStep ? "text-white" : "text-white/30"
                            }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Wizard Content */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                {currentStep < 3 && (
                    <div className="flex items-center justify-between mt-16 border-t border-black/5 pt-8">
                        <Button 
                            variant="ghost" 
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="h-14 px-8 rounded-full text-foreground/50 hover:text-foreground hover:bg-slate-50"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Geri
                        </Button>
                        <Button 
                            onClick={nextStep}
                            disabled={
                                (currentStep === 0 && !formData.date) ||
                                (currentStep === 1 && !formData.service) ||
                                (currentStep === 2 && (!formData.brideName || !formData.groomName || !formData.phone))
                            }
                            className="h-14 px-12 rounded-full bg-primary text-white hover:shadow-xl font-serif italic text-lg"
                        >
                            {currentStep === 2 ? "Tamamla" : "Devam Et"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </main>
    )
}
