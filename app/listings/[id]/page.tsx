"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { PROPERTIES } from "@/lib/data"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { 
    Star, MapPin, ChevronLeft, Share2, Heart, 
    Wifi, Car, Tv, Droplets, ShieldCheck, 
    Phone, MessageSquare, CheckCircle2,
    Calendar, ArrowLeft
} from "lucide-react"

export default function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const property = PROPERTIES.find(p => p.id === parseInt(resolvedParams.id))

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">Property Not Found</h1>
                    <Link href="/listings" className="text-primary font-bold hover:underline">Back to listings</Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            {/* Back Button & Actions */}
            <div className="pt-28 pb-6 container mx-auto px-6 flex items-center justify-between">
                <Link href="/listings" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-sm font-bold">Back to Search</span>
                </Link>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted transition-all text-sm font-bold">
                        <Share2 size={16} className="text-primary" />
                        <span>Share</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted transition-all text-sm font-bold">
                        <Heart size={16} className="text-primary" />
                        <span>Save</span>
                    </button>
                </div>
            </div>

            {/* Image Gallery Hub */}
            <div className="container mx-auto px-6 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
                    <div className="md:col-span-2 relative overflow-hidden rounded-3xl group">
                        <Image 
                            src={property.images[0]} 
                            alt={property.title} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 w-fit mb-3">
                                <Star size={12} className="text-primary fill-primary" />
                                <span className="text-[10px] font-black text-white uppercase">{property.rating} Highly Rated</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:grid grid-rows-2 gap-4">
                        <div className="relative overflow-hidden rounded-3xl">
                            <Image src={property.images[1]} alt="Gallery 2" fill className="object-cover" />
                        </div>
                        <div className="relative overflow-hidden rounded-3xl">
                            <Image src={property.images[2]} alt="Gallery 3" fill className="object-cover" />
                        </div>
                    </div>
                    <div className="hidden md:block relative overflow-hidden rounded-3xl bg-muted group">
                        <Image src={property.images[0]} alt="Gallery 4" fill className="object-cover blur-sm opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-white text-black px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                                View 12+ Photos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 pb-24 lg:grid lg:grid-cols-3 lg:gap-16">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Core Info */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{property.type}</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin size={14} className="text-secondary" />
                                <span className="text-sm font-bold">{property.location}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1]">{property.title}</h1>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-foreground">Property <span className="text-primary italic">Description.</span></h3>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                            {property.description}
                        </p>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-foreground">Premium <span className="text-primary italic">Amenities.</span></h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {property.amenities.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 group hover:bg-muted transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="font-bold text-foreground text-sm">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location/Map Placeholder */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-foreground">Prime <span className="text-primary italic">Location.</span></h3>
                        <div className="relative h-[300px] w-full bg-muted rounded-3xl border border-border overflow-hidden group">
                           <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/5 dark:bg-zinc-900/50">
                                <div className="text-center group-hover:scale-105 transition-transform">
                                    <MapPin size={48} className="mx-auto text-primary mb-4" />
                                    <p className="text-muted-foreground font-bold">Map integration coming soon.</p>
                                    <p className="text-zinc-400 text-xs mt-1">Exact coordinates: {property.location}</p>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Contact Sidebar */}
                <div className="mt-12 lg:mt-0">
                    <div className="lg:sticky lg:top-32 bg-card border border-border p-8 rounded-[3rem] shadow-2xl shadow-primary/5 space-y-8">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monthly Rent</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-black text-primary">{property.price}</h2>
                                <span className="text-muted-foreground font-bold">/ month</span>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Landlord Card */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg">
                                {property.landlord.name[0]}
                            </div>
                            <div>
                                <h4 className="font-black text-foreground">{property.landlord.name}</h4>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-secondary" />
                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Verified Landlord</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <a 
                                href={`tel:${property.landlord.phone}`}
                                className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                            >
                                <Phone size={18} />
                                Call Landlord
                            </a>
                            <a 
                                href={`https://wa.me/${property.landlord.whatsapp.replace(/\s+/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-green-500/30 active:scale-95"
                            >
                                <MessageSquare size={18} />
                                Chat WhatsApp
                            </a>
                        </div>

                        <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                            Always visit the property in person before making any payments. Report suspicious listings to our help desk.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
