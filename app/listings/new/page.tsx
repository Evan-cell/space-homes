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
import { createListing } from "@/lib/supabase-actions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
        bedrooms: 1,
        bathrooms: 1,
        spaceSize: "",
        phoneNumber: "",
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const uploadImages = async (): Promise<string[]> => {
        const urls: string[] = [];
        setUploadingImages(true);

        for (const file of imageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `listings/${fileName}`;

            const { data, error } = await supabase.storage
                .from('property-images')
                .upload(filePath, file);

            if (error) {
                console.error("Upload error:", error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);

            urls.push(publicUrl);
        }

        setUploadingImages(false);
        return urls;
    };

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

        try {
            // 1. Upload Images
            const uploadedUrls = await uploadImages();
            
            // 2. Create Listing
            const result = await createListing({
                ...formData,
                priceValue: formData.price.replace(/,/g, ''),
                images: uploadedUrls.length > 0 ? uploadedUrls : [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000"
                ] 
            });

            if (result.success) {
                toast.success("Listing published successfully!");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Failed to create listing:", error);
            toast.error("Failed to publish listing. Please try again.");
        } finally {
            setLoading(false);
        }
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
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev, 
                                            type: val,
                                            // Auto-set rooms for small units
                                            ...( (val === "Bedsitter" || val === "Single Room") ? { bedrooms: 1, bathrooms: 1 } : {} )
                                        }));
                                    }}
                                >
                                    {["Bedsitter", "Studio", "1 Bedroom", "2+ Bedrooms", "Single Room"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional Rooms & Bathrooms */}
                            {!(formData.type === "Bedsitter" || formData.type === "Single Room") && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">No. of Bedrooms</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="w-full bg-muted/30 border border-border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                            value={formData.bedrooms}
                                            onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">No. of Bathrooms</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="w-full bg-muted/30 border border-border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                            value={formData.bathrooms}
                                            onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Space size (sqft)</label>
                                <input 
                                    type="number" 
                                    placeholder="450"
                                    className="w-full bg-muted/30 border border-border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                    value={formData.spaceSize}
                                    onChange={(e) => setFormData({...formData, spaceSize: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Direct Contact No. (WhatsApp/Call)</label>
                                <input 
                                    type="tel" 
                                    placeholder="e.g. +254 712 345 678"
                                    required
                                    className="w-full bg-muted/30 border border-border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                />
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
                            <label className="aspect-video rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 p-8 group hover:border-primary/50 cursor-pointer bg-muted/10 transition-colors relative overflow-hidden">
                                {uploadingImages ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Uploading...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-foreground uppercase tracking-widest text-xs">Upload Clear Photos</p>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-1">Select one or more images</p>
                                        </div>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={uploadingImages}
                                />
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {imageFiles.slice(0, 4).map((file, i) => (
                                    <div key={i} className="aspect-square bg-muted/40 rounded-3xl border border-border relative overflow-hidden group">
                                        <img 
                                            src={URL.createObjectURL(file)} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {imageFiles.length < 4 && Array.from({ length: 4 - imageFiles.length }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-muted/10 rounded-3xl border border-dashed border-border/50" />
                                ))}
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
