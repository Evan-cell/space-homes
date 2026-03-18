"use client";

import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HouseCard from "./HouseCard";

interface HouseCarouselProps {
    listings?: any[];
}

export default function HouseCarousel({ listings = [] }: HouseCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay()]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-20 max-w-[1600px]">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Verified Listings</span>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            Trending Rentals in <span className="text-primary italic">Nairobi.</span>
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={scrollPrev}
                            className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-95 bg-card shadow-sm"
                        >
                            <ChevronLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 shadow-md"
                        >
                            <ChevronRight className="w-6 h-6 text-primary-foreground" />
                        </button>
                    </div>
                </div>

                <div className="embla overflow-hidden mt-8 -mx-4 px-4" ref={emblaRef}>
                    <div className="flex gap-6">
                        {listings.slice(0, 8).map((house) => (
                            <div key={house.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0">
                                <HouseCard {...house} />
                            </div>
                        ))}
                        {listings.length === 0 && (
                            <div className="flex-[0_0_100%] py-12 text-center text-muted-foreground font-bold italic">
                                Feature listings will appear here soon.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
