"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { User, Home, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { setUserRole } from "@/lib/clerk-actions";

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [role, setRole] = useState<"tenant" | "landlord" | null>(null);
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        if (!role || !user) return;
        setLoading(true);

        try {
            await setUserRole(role); 
            
            // Redirect based on role using window.location.href for hard refresh
            // this ensures session/middleware sync
            if (role === "landlord") {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/listings";
            }
        } catch (error) {
            console.error("Failed to set role:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Automatic redirect if role already exists and we're not currently submitting a new one
        if (isLoaded && user?.publicMetadata?.role && !loading) {
            const role = user.publicMetadata.role as string;
            const target = role === "landlord" ? "/dashboard" : "/listings";
            
            // Check if we're already on that page or navigating to it to avoid loops
            if (window.location.pathname !== target) {
                window.location.href = target;
            }
        }
    }, [isLoaded, user, loading]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Initialising Space...</p>
                <p className="mt-4 text-[10px] text-muted-foreground">Taking too long? Try <button onClick={() => window.location.reload()} className="underline text-primary">reloading</button></p>
            </div>
        );
    }

    // If user already has a role, they are being redirected
    if (user?.publicMetadata?.role && !loading) {
        const role = user.publicMetadata.role as string;
        const target = role === "landlord" ? "/dashboard" : "/listings";
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Redirecting to {role} portal...</p>
                <div className="flex flex-col gap-4 mt-8">
                    <Link href={target} className="text-sm font-black text-primary hover:underline">
                        Click here if not redirected automatically
                    </Link>
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                        Back to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background selection:bg-primary selection:text-white">
            <Navbar />
            
            <div className="pt-32 pb-20 container mx-auto px-6 flex flex-col items-center animate-fade-in">
                <div className="max-w-2xl w-full text-center space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-xs">
                            <Sparkles size={14} />
                            <span>Welcome to SpaceKC</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
                            How will you use <span className="text-primary italic">Space?</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Choose your journey to help us personalize your experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        {/* Tenant Option */}
                        <button
                            onClick={() => setRole("tenant")}
                            className={`relative p-8 rounded-[2.5rem] border-2 transition-all text-left space-y-4 group overflow-hidden ${
                                role === "tenant" 
                                ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" 
                                : "border-border bg-card hover:border-primary/50"
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                role === "tenant" ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            }`}>
                                <User size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground">I'm a Tenant</h3>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    I'm looking for beautiful, verified homes to rent in Nairobi.
                                </p>
                            </div>
                            {role === "tenant" && (
                                <div className="absolute top-4 right-4">
                                    <ShieldCheck className="text-primary" size={24} />
                                </div>
                            )}
                        </button>

                        {/* Landlord Option */}
                        <button
                            onClick={() => setRole("landlord")}
                            className={`relative p-8 rounded-[2.5rem] border-2 transition-all text-left space-y-4 group overflow-hidden ${
                                role === "landlord" 
                                ? "border-secondary bg-secondary/5 shadow-2xl shadow-secondary/10" 
                                : "border-border bg-card hover:border-secondary/50"
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                role === "landlord" ? "bg-secondary text-white" : "bg-muted text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary"
                            }`}>
                                <Home size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground">I'm a Landlord</h3>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    I want to list my properties and manage units easily.
                                </p>
                            </div>
                            {role === "landlord" && (
                                <div className="absolute top-4 right-4">
                                    <ShieldCheck className="text-secondary" size={24} />
                                </div>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={!role || loading}
                        className="w-full md:w-auto min-w-[300px] mt-12 vibrant-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {loading ? "Optimizing Experience..." : "Start Your Journey"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                    
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                        You can always change your profile type later in settings.
                    </p>
                </div>
            </div>
        </main>
    );
}
