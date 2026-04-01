"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import UnlockContactModal from "@/components/UnlockContactModal"
import { Check, Zap, Star, ShieldCheck, CreditCard, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function SubscriptionPage() {
    const { user } = useUser()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)

    const plans = [
        {
            name: "Daily Plan",
            price: "100",
            period: "day",
            tag: null,
            color: "border-border hover:border-primary/30",
            btnColor: "bg-muted text-foreground"
        },
        {
            name: "Weekly Plan",
            price: "199",
            period: "week",
            tag: "Most Popular",
            color: "border-primary shadow-2xl shadow-primary/10 scale-105 z-10",
            btnColor: "bg-primary text-primary-foreground",
            highlight: true
        },
        {
            name: "Monthly Plan",
            price: "499",
            period: "month",
            tag: "Best Value",
            color: "border-border hover:border-primary/30",
            btnColor: "bg-muted text-foreground"
        }
    ]

    const features = [
        "Unlimited access to contact details",
        "Full map location access",
        "Unlimited property views",
        "Premium badges on saved listings"
    ]

    const handleSubscribeClick = (plan: any) => {
        setSelectedPlan(plan)
        setIsModalOpen(true)
    }

    return (
        <main className="min-h-screen bg-[#FDFCF9] dark:bg-[#0F110C] transition-colors duration-300">
            <Navbar />

            <div className="pt-32 pb-24 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                    <span className="text-[#4A6741] font-black uppercase tracking-[0.3em] text-[10px] bg-[#EEF2EC] px-4 py-1.5 rounded-full">Unlock Full Access</span>
                    <h1 className="text-4xl md:text-6xl font-black text-[#1A1C19] dark:text-[#E2E3DE] tracking-tight leading-[1.1]">
                        Find Your Home <br />
                        <span className="text-[#4A6741] italic">Without Limits.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">Choose a plan that works for you</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx} 
                            className={`relative bg-white dark:bg-[#1A1C19] p-8 rounded-[3rem] border-2 transition-all flex flex-col h-full ${
                                plan.highlight 
                                ? "border-[#4A6741] shadow-2xl shadow-[#4A6741]/10 md:scale-110 z-10 py-12" 
                                : "border-[#E2E3DE] dark:border-[#2C2F2A] hover:border-[#4A6741]/30"
                            }`}
                        >
                            {plan.tag && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4A6741] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                                    {plan.tag}
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-black mb-2 text-[#1A1C19] dark:text-[#E2E3DE]">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-[#4A6741]">KSh {plan.price}</span>
                                    <span className="text-sm font-bold text-muted-foreground">/{plan.period}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#EEF2EC] dark:bg-[#2C2F2A] flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-[#4A6741]" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-[#1A1C19]/70 dark:text-[#E2E3DE]/70 leading-snug">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => handleSubscribeClick(plan)}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group ${
                                    plan.highlight 
                                    ? "bg-[#4A6741] text-white" 
                                    : "bg-[#EEF2EC] dark:bg-[#2C2F2A] text-[#1A1C19] dark:text-[#E2E3DE]"
                                }`}
                            >
                                {plan.highlight ? <Zap className="w-4 h-4 fill-white" /> : <CreditCard className="w-4 h-4" />}
                                Subscribe Now
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-20 max-w-2xl mx-auto p-8 rounded-[2.5rem] bg-[#EEF2EC]/30 dark:bg-[#1A1C19]/30 border border-[#E2E3DE] dark:border-[#2C2F2A] text-center space-y-4">
                    <div className="flex justify-center -space-x-3 mb-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-[#1A1C19] bg-[#EEF2EC] flex items-center justify-center overflow-hidden`}>
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123 + 456}`} alt="User" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <p className="text-sm font-bold text-[#1A1C19]/60 dark:text-[#E2E3DE]/60">
                        Join <span className="text-[#1A1C19] dark:text-[#E2E3DE] font-black">5,000+</span> tenants using SpaceKC to find their dream homes safely and quickly.
                    </p>
                </div>
            </div>

            <Footer />

            {selectedPlan && (
                <UnlockContactModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode="subscription"
                    plan={selectedPlan}
                    onSuccess={() => {
                        window.location.href = "/listings"
                    }}
                />
            )}
        </main>
    )
}
