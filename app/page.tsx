import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HouseCarousel from "@/components/HouseCarousel";
import Footer from "@/components/Footer";
import HouseCard from "@/components/HouseCard";
import Link from "next/link";
import { PROPERTIES } from "@/lib/data";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Navbar />

      <main>
        <Hero />

        <HouseCarousel />

        {/* Featured Section */}
        <section className="py-32 bg-background transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="mb-20 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-1 vibrant-gradient rounded-full" />
                <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Elite Collection</span>
                <div className="w-10 h-1 vibrant-gradient rounded-full" />
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                Fresh From <span className="text-primary italic">The Market.</span>
              </h2>
              <p className="text-muted-foreground font-bold max-w-2xl mx-auto">
                Discover our latest premium listings, each hand-verified for quality and landlord reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROPERTIES.slice(0, 4).map((property) => (
                <HouseCard key={property.id} {...property} />
              ))}
            </div>

            <div className="mt-20 text-center">
              <Link href="/listings" className="inline-block vibrant-gradient text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:scale-110 active:scale-95 transition-all">
                Explore All 500+ Houses
              </Link>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
