"use client";

import { Search, MapPin, House, Banknote, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-background">
            {/* Subtle Gradient BG */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                {/* Floating Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/10 px-5 py-2 rounded-full border border-primary/20 mb-8 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Verified Premium Rentals</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tight leading-[1.1] animate-fade-in-up">
                    Find Your Next <br />
                    <span className="text-primary italic">Dream Rental.</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                    Search through thousands of verified apartments, bedsitters, and homes. Direct contact with landlords, no middleman.
                </p>

                {/* Restored Search Hub */}
                <div className="max-w-5xl mx-auto relative group animate-fade-in-up animation-delay-400">
                    <div className="relative bg-card p-2 md:p-3 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-border">
                        <div className="flex flex-col lg:flex-row items-stretch gap-2">

                            {/* Filter Group */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                {/* Location */}
                                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all hover:bg-muted group/input">
                                    <MapPin className="w-6 h-6 text-primary group-hover/input:scale-110 transition-transform" />
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground mb-1">Where</span>
                                        <input
                                            type="text"
                                            placeholder="Enter city or area..."
                                            className="bg-transparent border-none outline-none text-foreground font-bold placeholder:text-muted-foreground/50 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Type */}
                                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all hover:bg-muted group/input">
                                    <House className="w-6 h-6 text-secondary group-hover/input:scale-110 transition-transform" />
                                    <div className="flex flex-col items-start w-full">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground mb-1">Type</span>
                                        <select className="bg-transparent border-none outline-none text-foreground font-bold w-full appearance-none cursor-pointer">
                                            <option value="">Bedsitter</option>
                                            <option value="single">Single</option>
                                            <option value="1br">1 Bedroom</option>
                                            <option value="2br">2+ Bedrooms</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all hover:bg-muted group/input">
                                    <Banknote className="w-6 h-6 text-primary group-hover/input:scale-110 transition-transform" />
                                    <div className="flex flex-col items-start w-full">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground mb-1">Budget (KSH)</span>
                                        <input 
                                            type="number" 
                                            placeholder="e.g. 15000"
                                            className="bg-transparent border-none outline-none text-foreground font-bold w-full placeholder:text-muted-foreground/30"
                                            min="3000"
                                            max="30000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Link href="/sign-in?redirect_url=/listings" className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 group/btn">
                                <Search className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                <span>Find Rentals</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
