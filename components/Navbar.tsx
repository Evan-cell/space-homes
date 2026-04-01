"use client";

import Link from "next/link";
import { Search, User, Menu, X, Sparkles, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { UserButton, Show, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { getUserStats } from "@/lib/supabase-actions";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        
        // Initial fetch
        if (user) {
            getUserStats().then(stats => setUnreadCount(stats?.unreadEnquiries || 0));
            
            // Real-time subscription for unread count
            const channel = supabase
                .channel('navbar_notifications')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'messages' },
                    () => {
                        // Re-fetch stats when any message change occurs (new or read)
                        getUserStats().then(stats => setUnreadCount(stats?.unreadEnquiries || 0));
                    }
                )
                .subscribe();

            return () => {
                window.removeEventListener("scroll", handleScroll);
                supabase.removeChannel(channel);
            };
        }
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, [user]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md py-4 px-6 md:px-20 shadow-sm border-b border-border" : "bg-transparent py-6 px-6 md:px-20"}`}>
            <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <img 
                        src="/house-svgrepo-com.svg" 
                        alt="SpaceKC Logo" 
                        className="w-10 h-10 object-contain transform group-hover:rotate-6 transition-transform drop-shadow-[0_4px_12px_rgba(var(--primary),0.3)]" 
                    />
                    <span className={`text-xl font-black tracking-tight transition-colors text-foreground`}>
                        Space<span className="text-primary italic">KC</span>
                    </span>
                </Link>

                {/* Center Links */}
                <div className="hidden md:flex items-center gap-8">
                    {["Home", "Listings", "About", "Contact"]
                        .filter(item => {
                            if (item === "Listings") {
                                return user?.publicMetadata?.role !== "landlord";
                            }
                            return true;
                        })
                        .map((item) => (
                        <Link
                            key={item}
                            href={
                                item === "Home" ? "/" : 
                                (item === "Listings" && !user) ? "/sign-up?redirect_url=/listings" : 
                                `/${item.toLowerCase()}`
                            }
                            className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                    {/* Unified Mobile/Desktop Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4">

                    <Show when="signed-in">
                        <Link 
                            href="/dashboard" 
                            className="p-2 sm:p-2.5 rounded-full hover:bg-accent transition-all shrink-0 relative group"
                        >
                            <MessageSquare className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-background animate-in zoom-in duration-300">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    </Show>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <button className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95">
                                    <User className="w-4 h-4" />
                                    <span>Join Now</span>
                                </button>
                            </SignInButton>
                        </Show>
                        <Show when="signed-in">
                            <Link 
                                href="/dashboard" 
                                className="hidden lg:block text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-xl bg-card border border-border"
                            >
                                {user?.publicMetadata?.role === "landlord" ? "Landlord Dashboard" : "Dashboard"}
                            </Link>
                            <div className="pl-1 sm:pl-0">
                                <UserButton />
                            </div>
                        </Show>
                    </div>

                    <button
                        className="md:hidden p-2 ml-1 text-foreground shrink-0 rounded-full hover:bg-accent transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-20 left-4 right-4 bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-4 shadow-2xl z-50">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Appearance</span>
                        <ThemeToggle />
                    </div>

                    {["Home", "Listings", "About", "Contact"]
                        .filter(tab => {
                            if (tab === "Listings") {
                                return user?.publicMetadata?.role !== "landlord";
                            }
                            return true;
                        })
                        .map((tab) => (
                        <Link 
                            key={tab} 
                            href={
                                tab === "Home" ? "/" : 
                                (tab === "Listings" && !user) ? "/sign-up?redirect_url=/listings" : 
                                `/${tab.toLowerCase()}`
                            } 
                            className="text-lg font-black text-foreground hover:text-primary transition-colors py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            {tab}
                        </Link>
                    ))}

                    <div className="pt-4 border-t border-border/50">
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <button className="w-full bg-primary text-primary-foreground text-center py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Join SpaceKC
                                </button>
                            </SignInButton>
                        </Show>

                        <Show when="signed-in">
                            <Link 
                                href="/dashboard" 
                                className="w-full flex justify-center bg-primary text-primary-foreground text-center py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                Go to Dashboard
                            </Link>
                        </Show>
                    </div>
                </div>
            )}
        </nav>
    );
}
