"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Check, Zap, Star, ShieldCheck, CreditCard, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function SubscriptionPage() {
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

    return (
        <main className="min-h-screen bg-[#FDFCF9] dark:bg-background transition-colors duration-300">
            <Navbar />

            <div className="pt-32 pb-24 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Premium Access</span>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
                        Unlock Full <span className="text-primary italic">Access.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">Choose a plan that works for you</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx} 
                            className={`relative bg-card p-8 rounded-[3rem] border-2 transition-all flex flex-col ${plan.color}`}
                        >
                            {plan.tag && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                                    {plan.tag}
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-black mb-2 text-foreground">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-primary">KSh {plan.price}</span>
                                    <span className="text-sm font-bold text-muted-foreground">/{plan.period}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-muted-foreground leading-snug">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`${plan.btnColor} w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group`}>
                                {plan.highlight ? <Zap className="w-4 h-4 fill-primary-foreground" /> : <CreditCard className="w-4 h-4" />}
                                Subscribe Now
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-20 max-w-2xl mx-auto p-8 rounded-[2.5rem] bg-muted/30 border border-border/50 text-center space-y-4">
                    <div className="flex justify-center -space-x-3 mb-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center overflow-hidden`}>
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">
                        Join <span className="text-foreground font-black">5,000+</span> tenants using SpaceKC to find their dream homes safely and quickly.
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    )
}
