"use client";

import { useState, useMemo, useEffect, Suspense } from "react"
import { useUser, Show } from "@clerk/nextjs"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import HouseCard from "@/components/HouseCard"
import { PROPERTIES } from "@/lib/data"
import { getListings } from "@/lib/supabase-actions"
import { Search, MapPin, House, Banknote, SlidersHorizontal, LayoutGrid, List, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function ListingsContent() {
    const searchParams = useSearchParams()
    const { user, isLoaded } = useUser()
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [propertyType, setPropertyType] = useState("All")
    const [maxPrice, setMaxPrice] = useState(50000)
    
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        async function loadListings() {
            try {
                const data = await getListings()
                console.log("Listings loaded:", data)
                setListings(data)
            } catch (error) {
                console.error("Failed to load listings:", error)
            } finally {
                setLoading(false)
            }
        }
        loadListings()
    }, [])

    useEffect(() => {
        const query = searchParams.get("search")
        if (query) setSearchQuery(query)
    }, [searchParams])

    const role = user?.publicMetadata?.role as string | undefined
    const isLandlord = role === "landlord"

    // If landlord, they shouldn't be here, redirect to dashboard
    if (isLandlord && isLoaded) {
        window.location.href = "/dashboard";
        return null;
    }

    const filteredProperties = useMemo(() => {
        // Only use real listings from Supabase
        const baseProperties = listings
        
        return baseProperties.filter(p => {
            const matchesSearch = p.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesType = propertyType === "All" || p.type === propertyType
            const matchesPrice = p.priceValue <= maxPrice
            return matchesSearch && matchesType && matchesPrice
        })
    }, [listings, searchQuery, propertyType, maxPrice])

    // Pagination Logic
    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
    const paginatedProperties = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredProperties.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredProperties, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, propertyType, maxPrice])

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            {isLandlord ? "Your Portfolio" : "Explore Nairobi"}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            {isLandlord ? "Manage Your" : "Available"} <span className="text-primary italic">{isLandlord ? "Listings." : "Rentals."}</span>
                        </h1>
                    </div>
                    {isLandlord && (
                        <Link 
                            href="/dashboard" 
                            className="bg-card border border-border px-6 py-3 rounded-2xl flex items-center gap-2 group hover:border-primary transition-all shadow-xl shadow-primary/5"
                        >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Sparkles size={16} />
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary">Back to Dashboard</span>
                        </Link>
                    )}
                    {!isLandlord && (
                        <div className="flex items-center gap-4 bg-muted p-1 rounded-xl border border-border">
                            <button className="p-2 rounded-lg bg-card text-primary shadow-sm"><LayoutGrid size={18} /></button>
                            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground"><List size={18} /></button>
                        </div>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-card border border-border p-4 md:p-6 rounded-3xl shadow-xl shadow-primary/5 mb-12 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                        
                        {/* Location */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Location</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:scale-110 transition-transform" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Westlands"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Property Type</label>
                            <div className="relative group">
                                <House className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                <select 
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className="w-full bg-muted border border-border/50 rounded-2xl py-3.5 pl-11 pr-10 text-sm font-bold text-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="All">All Types</option>
                                    <option value="Bedsitter">Bedsitter</option>
                                    <option value="Single">Single Room</option>
                                    <option value="Studio">Studio</option>
                                    <option value="1 Bedroom">1 Bedroom</option>
                                    <option value="2+ Bedrooms">2+ Bedrooms</option>
                                </select>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] uppercase font-black text-muted-foreground">Max Budget</label>
                                <span className="text-[10px] font-black text-primary">KES {maxPrice.toLocaleString()}</span>
                            </div>
                            <div className="relative flex items-center h-12 px-4 bg-muted border border-border/50 rounded-2xl">
                                <Banknote className="w-4 h-4 text-primary mr-3" />
                                <input 
                                    type="range" 
                                    min="3000" 
                                    max="50000" 
                                    step="500"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                    className="flex-1 accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Sort & Count */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 h-12 px-2">
                             <span className="text-xs font-bold text-muted-foreground">
                                <span className="text-foreground">{filteredProperties.length}</span> results
                             </span>
                             <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors">
                                <SlidersHorizontal size={14} />
                                Sort By
                             </button>
                        </div>
                    </div>
                </div>

                {/* Property Grid */}
                {paginatedProperties.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up">
                            {paginatedProperties.map((property) => (
                                <HouseCard key={property.id} {...property} />
                            ))}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="mt-20 flex items-center justify-center gap-4">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:border-primary transition-all active:scale-90"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${
                                                currentPage === i + 1 
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                                                : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:border-primary transition-all active:scale-90"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-32 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No matching rentals found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                        <button 
                            onClick={() => {setSearchQuery(""); setPropertyType("All"); setMaxPrice(30000);}}
                            className="mt-8 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}

export default function ListingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Listings...</p>
            </div>
        }>
            <ListingsContent />
        </Suspense>
    )
}
