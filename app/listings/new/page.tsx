"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Home, MapPin, DollarSign, Info, 
    Upload, CheckCircle2, ArrowLeft, 
    Sparkles, Camera, Plus, X 
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NewListingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        type: "Bedsitter",
        description: "",
        amenities: [] as string[],
    });

    const amenitiesOptions = [
        "WiFi", "Parking", "Security 24/7", 
        "Borehole Water", "Backup Generator", 
        "Gym", "Swimming Pool", "Balcony",
        "Elevator", "CCTV", "Garden"
    ];

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard");
        }, 2000);
    };

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            <div className="pt-28 pb-24 container mx-auto px-6 max-w-4xl">
                {/* Back Link */}
                <Link href="/dashboard" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-colors mb-10 w-fit">
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-sm font-bold">Back to Dashboard</span>
                </Link>

                {/* Form Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-secondary font-black uppercase tracking-[0.3em] text-[10px]">
                            <Sparkles size={14} />
                            <span>List Your Property</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
                            Let's Market Your <span className="text-primary italic">Investment.</span>
                        </h1>
                    </div>
                </div>

                {/* Form Layout */}
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Basic Details */}
                    <div className="bg-card border border-border p-8 rounded-[3rem] shadow-2xl shadow-primary/5 space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h3 className="text-xl font-black text-foreground">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Property Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Luxury 1 Bedroom Loft"
                                    required
                                    className="w-full bg-muted/30 border border-border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Monthly Rent (KES)</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">KES</div>
                                    <input 
                                        type="number" 
                                        placeholder="15,000"
                                        required
                                        className="w-full bg-muted/30 border border-border pl-16 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Westlands, Nairobi"
                                        required
                                        className="w-full bg-muted/30 border border-border pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Property Type</label>
                                <select 
                                    className="w-full bg-muted/30 border border-border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground appearance-none cursor-pointer"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    {["Bedsitter", "Studio", "1 Bedroom", "2+ Bedrooms", "Single Room"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                            <textarea 
                                rows={4}
                                placeholder="Describe the unit, proximity to road, water situation, etc."
                                required
                                className="w-full bg-muted/30 border border-border px-6 py-5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-card border border-border p-8 rounded-[3rem] shadow-2xl shadow-primary/5 space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <h3 className="text-xl font-black text-foreground">Amenities & Features</h3>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {amenitiesOptions.map((amenity) => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                                        formData.amenities.includes(amenity)
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50"
                                    }`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-card border border-border p-8 rounded-[3rem] shadow-2xl shadow-primary/5 space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Camera size={20} />
                            </div>
                            <h3 className="text-xl font-black text-foreground">Property Images</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="aspect-video rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 p-8 group hover:border-primary/50 cursor-pointer bg-muted/10 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-foreground uppercase tracking-widest text-xs">Upload Clear Photos</p>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-1">PNG, JPG up to 10MB</p>
                                </div>
                                <input type="file" className="hidden" multiple />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square bg-muted/40 rounded-3xl border border-border animate-pulse" />
                                <div className="aspect-square bg-muted/40 rounded-3xl border border-border animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
                        <div className="text-center md:text-left">
                           <p className="text-sm font-bold text-foreground">Review your details carefully.</p>
                           <p className="text-xs text-muted-foreground mt-1">Our team will verify the listing within 24 hours.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto min-w-[300px] bg-primary text-primary-foreground py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? "Publishing Listing..." : "Verify & Publish Listing"}
                            {!loading && <CheckCircle2 size={18} />}
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </main>
    );
}
