import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, Shield, Users, MapPin, Star, Zap, Heart, TrendingUp } from "lucide-react";

const stats = [
    { label: "Active Listings", value: "500+", icon: Home },
    { label: "Verified Landlords", value: "200+", icon: Shield },
    { label: "Happy Tenants", value: "1,000+", icon: Heart },
    { label: "Nairobi Locations", value: "30+", icon: MapPin },
];

const values = [
    {
        icon: Shield,
        title: "Trust & Verification",
        description: "Every landlord and listing on SpaceKC goes through a manual verification process. We ensure you only see authentic, available properties.",
    },
    {
        icon: Zap,
        title: "Instant Access",
        description: "Skip the endless back-and-forth. With our M-Pesa powered unlock feature, you get the landlord's contact within seconds.",
    },
    {
        icon: Users,
        title: "Community First",
        description: "We built SpaceKC for Nairobi's people. Both tenants searching for a home and landlords looking for the right tenants benefit from our platform.",
    },
    {
        icon: TrendingUp,
        title: "Market Transparency",
        description: "No hidden fees, no fake prices. SpaceKC gives renters full visibility into real market rates and fair pricing across all neighborhoods.",
    },
];

const team = [
    { name: "Malcolm Chege", role: "Founder & CEO", initials: "MC" },
    { name: "Product Team", role: "Engineering & Design", initials: "PT" },
    { name: "Operations", role: "Listings & Verification", initials: "OT" },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-6 container mx-auto max-w-5xl text-center">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Our Story</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mt-4 mb-6 leading-[1.05]">
                    Renting in Nairobi,{" "}
                    <span className="text-primary italic">Simplified.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto">
                    SpaceKC was born from one simple frustration — finding a trustworthy rental in Nairobi was too hard, too slow, and too risky. We built the solution we wished existed.
                </p>
            </section>

            {/* Stats */}
            <section className="pb-24 px-6">
                <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-card border border-border rounded-3xl p-6 text-center group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Icon size={22} />
                            </div>
                            <p className="text-3xl font-black text-foreground">{value}</p>
                            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-muted/30 border-y border-border">
                <div className="container mx-auto max-w-5xl px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Our Mission</span>
                        <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 leading-tight">
                            A Platform Built on <span className="text-primary italic">Honesty.</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                            In a market full of fake listings, scam landlords, and overpriced agencies, SpaceKC stands as the transparent alternative. We charge tenants a small, fair fee to access a landlord's direct contacts — cutting out middlemen entirely.
                        </p>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            Our goal is to make finding a safe, comfortable, and affordable home in Nairobi as simple as a few taps on your phone.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {values.slice(0, 4).map(({ icon: Icon, title }) => (
                            <div key={title} className="bg-card border border-border p-5 rounded-3xl group hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Icon size={18} />
                                </div>
                                <p className="font-black text-foreground text-sm">{title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Our Values</span>
                        <h2 className="text-4xl md:text-5xl font-black mt-4">What We Stand <span className="text-primary italic">For.</span></h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex gap-6 p-8 bg-card border border-border rounded-3xl group hover:border-primary/30 transition-all hover:shadow-lg">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground text-lg mb-2">{title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24 bg-muted/30 border-y border-border px-6">
                <div className="container mx-auto max-w-5xl text-center">
                    <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">The People Behind It</span>
                    <h2 className="text-4xl md:text-5xl font-black mt-4 mb-16">Meet the <span className="text-primary italic">Team.</span></h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        {team.map(({ name, role, initials }) => (
                            <div key={name} className="flex flex-col items-center gap-4 group">
                                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                    {initials}
                                </div>
                                <div>
                                    <p className="font-black text-foreground">{name}</p>
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center">
                <div className="container mx-auto max-w-3xl">
                    <Star className="w-10 h-10 text-primary mx-auto mb-6 fill-primary" />
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Find Your <span className="text-primary italic">Space?</span></h2>
                    <p className="text-lg text-muted-foreground mb-10">Join thousands of Nairobians who found their perfect rental home through SpaceKC.</p>
                    <a
                        href="/listings"
                        className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        Browse Listings
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
