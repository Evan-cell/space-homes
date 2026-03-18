"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";

interface HouseCardProps {
    id: string | number;
    images: string[];
    title: string;
    price: string;
    location: string;
    type: string;
    rating?: number;
}

export default function HouseCard({ id, images, title, price, location, type, rating = 4.9 }: HouseCardProps) {
    return (
        <Link href={`/listings/${id}`} className="group flex flex-col gap-3 cursor-pointer animate-fade-in">
            {/* Image Thumbnail */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                    src={images[0]}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Heart Icon Toggle */}
                <button 
                    onClick={(e) => e.preventDefault()} 
                    className="absolute top-4 right-4 text-white drop-shadow-md hover:scale-110 transition-transform z-10"
                >
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" style={{ fill: "rgba(0, 0, 0, 0.5)", stroke: "#fff", strokeWidth: "2px" }}>
                        <path d="m16 28c7-4.733 14-10 14-17 0-3.868-3.059-7-7-7-2.327 0-4.385 1.144-5.711 3.012l-.289.408-.289-.408c-1.326-1.868-3.384-3.012-5.711-3.012-3.941 0-7 3.132-7 7 0 7 7 12.267 14 17z" />
                    </svg>
                </button>

                {/* Optional Badge */}
                <div className="absolute top-4 left-4 bg-card/95 px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary border border-primary/10 shadow-sm backdrop-blur-md">
                    Verified Rental
                </div>
            </div>

            {/* Info Section */}
            <div className="flex justify-between items-start mt-1 px-1">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground truncate">{location}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                            <span className="text-sm font-bold text-foreground/80">{rating}</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 truncate">{title}</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-primary">{price}</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">/ month</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
