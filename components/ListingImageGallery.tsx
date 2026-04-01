"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, X, Grid3X3 } from "lucide-react";

interface ListingImageGalleryProps {
    images: string[];
    title: string;
    rating?: number;
}

export default function ListingImageGallery({ images, title, rating }: ListingImageGalleryProps) {
    const allImages = images.length > 0 ? images : ["/placeholder.jpg"];
    const [mainIndex, setMainIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const displayedThumbs = allImages.slice(1, 4); // show up to 3 thumbnails
    const extraCount = allImages.length - 4; // images beyond the 4 shown

    const goPrev = () => setMainIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    const goNext = () => setMainIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));

    const getTag = (url: string) => {
        try {
            const urlObj = new URL(url, typeof window !== "undefined" ? window.location.origin : "");
            return urlObj.searchParams.get("tag");
        } catch (e) {
            return null;
        }
    };

    const lightboxPrev = () => setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    const lightboxNext = () => setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));

    return (
        <>
            <div className="container mx-auto px-4 md:px-6 mb-8 md:mb-12">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 h-auto md:h-[600px]">
                    {/* Main Large Card with Arrows */}
                    <div className="col-span-3 md:col-span-2 row-span-1 md:row-span-2 relative overflow-hidden rounded-2xl md:rounded-3xl group shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border aspect-[3/2] md:aspect-auto">
                        <Image 
                            src={allImages[mainIndex]} 
                            alt={title} 
                            fill 
                            unoptimized
                            className="object-cover transition-all duration-500"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-3">
                                <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 w-fit">
                                    <Star size={12} className="text-primary fill-primary" />
                                    <span className="text-[10px] font-black text-white uppercase">{rating || 4.9} Highly Rated</span>
                                </div>
                                {getTag(allImages[mainIndex]) && (
                                    <div className="bg-secondary/40 backdrop-blur-md px-3 py-1 rounded-full border border-secondary/30 w-fit text-[10px] font-black text-white uppercase">
                                        {getTag(allImages[mainIndex])}
                                    </div>
                                )}
                            </div>
                            <p className="text-white/60 text-[10px] font-bold">
                                {mainIndex + 1} / {allImages.length}
                            </p>
                        </div>

                        {/* Prev / Next Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={goPrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-lg"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={goNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-lg"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails (up to 3) */}
                    {displayedThumbs.map((img: string, i: number) => {
                        const isLastAndHasMore = i === 2 && extraCount > 0;
                        const tag = getTag(img);
                        return (
                            <div 
                                key={i + 1} 
                                onClick={() => {
                                    if (isLastAndHasMore) {
                                        setLightboxIndex(0);
                                        setShowAll(true);
                                    } else {
                                        setMainIndex(i + 1);
                                    }
                                }}
                                className="col-span-1 relative overflow-hidden rounded-xl md:rounded-2xl group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 aspect-[3/2] md:aspect-auto"
                            >
                                <Image 
                                    src={img} 
                                    alt={`${title} thumbnail ${i + 2}`} 
                                    fill 
                                    unoptimized
                                    className="object-cover transition-transform duration-500 md:group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                
                                {tag && (
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[8px] font-black text-white uppercase transform scale-90 origin-top-left z-10">
                                        {tag}
                                    </div>
                                )}

                                {/* +N overlay on the last thumbnail if there are more images */}
                                {isLastAndHasMore && (
                                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1">
                                        <Grid3X3 size={20} className="text-white" />
                                        <span className="text-white font-black text-sm">+{extraCount + 1}</span>
                                        <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">View All</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* If fewer than 4 images: "View All" or empty placeholder */}
                    {allImages.length >= 4 && displayedThumbs.length < 3 && (
                        <div className="col-span-1 hidden md:flex relative overflow-hidden rounded-3xl bg-muted/30 border-2 border-dashed border-border items-center justify-center aspect-square md:aspect-auto">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center px-2">More photos<br/>coming soon</p>
                        </div>
                    )}

                    {/* "View All Photos" button when all 3 thumbnails are used but no overflow */}
                    {allImages.length > 1 && allImages.length <= 4 && (
                        <div
                            onClick={() => { setLightboxIndex(0); setShowAll(true); }}
                            className="col-span-3 md:col-span-2 hidden md:flex items-center justify-center gap-3 cursor-pointer bg-muted/40 hover:bg-muted border border-border rounded-3xl transition-all group"
                        >
                            <Grid3X3 size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">View All Photos</span>
                        </div>
                    )}
                </div>

                {/* Mobile: View All button */}
                {allImages.length > 1 && (
                    <button
                        onClick={() => { setLightboxIndex(0); setShowAll(true); }}
                        className="mt-3 md:hidden w-full flex items-center justify-center gap-2 py-3 bg-muted/50 hover:bg-muted border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-muted-foreground transition-all"
                    >
                        <Grid3X3 size={16} />
                        View All {allImages.length} Photos
                    </button>
                )}
            </div>

            {/* Lightbox / View All Modal */}
            {showAll && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-in fade-in duration-200">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-4 md:px-8 py-4 shrink-0">
                        <div>
                            <p className="text-white font-black text-lg">{title}</p>
                            <p className="text-white/50 text-sm">{lightboxIndex + 1} of {allImages.length} photos</p>
                        </div>
                        <button
                            onClick={() => setShowAll(false)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Main Lightbox Image */}
                    <div className="flex-1 relative flex items-center justify-center px-4 md:px-20">
                        <div className="relative w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden">
                            <Image
                                src={allImages[lightboxIndex]}
                                alt={`${title} photo ${lightboxIndex + 1}`}
                                fill
                                unoptimized
                                className="object-contain"
                            />
                            {getTag(allImages[lightboxIndex]) && (
                                <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-white uppercase shadow-2xl border border-white/20">
                                    {getTag(allImages[lightboxIndex])}
                                </div>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={lightboxPrev}
                                    className="absolute left-2 md:left-6 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={lightboxNext}
                                    className="absolute right-2 md:right-6 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="shrink-0 px-4 pb-6 pt-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLightboxIndex(i)}
                                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all ${
                                        i === lightboxIndex 
                                            ? "ring-2 ring-primary scale-105" 
                                            : "opacity-50 hover:opacity-80"
                                    }`}
                                >
                                    <Image src={img} alt={`thumb ${i + 1}`} fill unoptimized className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
