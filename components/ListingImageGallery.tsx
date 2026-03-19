"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";

interface ListingImageGalleryProps {
    images: string[];
    title: string;
    rating?: number;
}

export default function ListingImageGallery({ images, title, rating }: ListingImageGalleryProps) {
    const [mainImage, setMainImage] = useState(images[0] || "/placeholder.jpg");

    // All images except the one currently set as main image
    const sideImages = images.filter((img) => img !== mainImage).slice(0, 3);

    return (
        <div className="container mx-auto px-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[300px] md:h-[500px]">
                {/* Main Large Card */}
                <div className="md:col-span-2 row-span-2 relative overflow-hidden rounded-3xl group shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border">
                    <Image 
                        src={mainImage} 
                        alt={title} 
                        fill 
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 w-fit mb-3">
                            <Star size={12} className="text-primary fill-primary" />
                            <span className="text-[10px] font-black text-white uppercase">{rating || 4.9} Highly Rated</span>
                        </div>
                    </div>
                </div>

                {/* Smaller Clickable Thumbnails */}
                {sideImages.map((img: string, i: number) => (
                    <div 
                        key={i} 
                        onClick={() => setMainImage(img)}
                        className="relative overflow-hidden rounded-3xl group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                        <Image 
                            src={img} 
                            alt={`${title} thumbnail`} 
                            fill 
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Interactive overlay to indicate clickability */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                ))}

                {/* Empty slots placeholder */}
                {images.length < 4 && (
                    <div className="hidden md:flex relative overflow-hidden rounded-3xl bg-muted/30 border-2 border-dashed border-border items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">More photos coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}
