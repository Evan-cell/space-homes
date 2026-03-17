"use client";

import { useUser } from "@clerk/nextjs";
import { 
    Plus, Home, MessageSquare, Bell, 
    TrendingUp, Users, Settings, LogOut,
    Search, Filter, MoreVertical, ExternalLink
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PROPERTIES } from "@/lib/data";
import HouseCard from "@/components/HouseCard";

export default function LandlordDashboard() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return null;

    // Simulate landlord's houses (filtering by a mock landlord name)
    const myHouses = PROPERTIES.slice(0, 3); // For demo purposes, showing first 3

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            <div className="pt-28 pb-20 container mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>Landlord Portal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            Welcome Back, <span className="text-primary italic">{user?.firstName || "Landlord"}</span>
                        </h1>
                    </div>
                    <Link 
                        href="/listings/new"
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 w-fit"
                    >
                        <Plus size={18} />
                        Add New Listing
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Total Listings", val: "12", icon: Home, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Active Inquiries", val: "48", icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { label: "Total Views", val: "2.4k", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
                        { label: "Shortlisted By", val: "156", icon: Users, color: "text-pink-500", bg: "bg-pink-500/10" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-lg transition-shadow">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-black text-foreground mt-1">{stat.val}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Listings Table Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-foreground">Your <span className="text-primary italic">Listings.</span></h3>
                            <div className="flex items-center gap-3">
                                <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors">
                                    <Search size={18} />
                                </button>
                                <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors">
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {myHouses.map((house) => (
                                <div key={house.id} className="relative group">
                                    <HouseCard {...house} />
                                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-zinc-900 border border-zinc-200 hover:bg-white transition-all shadow-xl">
                                            <Settings size={16} />
                                        </button>
                                        <button className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-zinc-900 border border-zinc-200 hover:bg-white transition-all shadow-xl">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Status</span>
                                            <span className="text-xs font-bold text-emerald-400">Available</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Inquiries</span>
                                            <span className="text-xs font-bold">12 New</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notifications/Questions Sidebar */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-foreground">Recent <span className="text-primary italic">Activity.</span></h3>
                            <Bell size={20} className="text-primary" />
                        </div>

                        <div className="space-y-4">
                            {[
                                { user: "David M.", action: "asked about water supply", time: "2 mins ago", type: "question" },
                                { user: "Grace K.", action: "shortlisted your property", time: "45 mins ago", type: "shortlist" },
                                { user: "Peter O.", action: "booked a viewing", time: "2 hours ago", type: "booking" },
                                { user: "System", action: "Verification complete", time: "1 day ago", type: "update" },
                            ].map((act, i) => (
                                <div key={i} className="bg-card border border-border p-5 rounded-3xl flex gap-4 hover:border-primary/30 transition-colors group cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        {act.type === "question" ? <MessageSquare size={20} /> : <Bell size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">
                                            {act.user} <span className="font-medium text-muted-foreground">{act.action}</span>
                                        </p>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{act.time}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary mt-1" />
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors">
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

function ChevronRight({ className, size }: { className?: string; size?: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
