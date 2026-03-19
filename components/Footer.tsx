import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, ArrowUpRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-muted text-foreground pt-24 pb-12 relative overflow-hidden border-t border-border/50">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-0" />

            <div className="container mx-auto px-6 relative z-10 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Identity */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-3">
                            <img 
                                src="/house-svgrepo-com.svg" 
                                alt="SpaceKC Logo" 
                                className="w-10 h-10 object-contain drop-shadow-[0_4px_12px_rgba(var(--primary),0.3)]" 
                            />
                            <span className="text-xl font-black tracking-tight text-foreground">
                                Space<span className="text-primary italic">KC</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground font-medium leading-relaxed">
                            Nairobi's most trusted rental marketplace. We connect verified tenants directly with landlords for a seamless experience.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm group">
                                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Sections */}
                    {[
                        {
                            title: "Discover",
                            links: ["Featured Rentals", "New Arrivals", "Premium Studios", "Popular Areas"]
                        },
                        {
                            title: "Company",
                            links: ["About Us", "Contact Support", "Trust & Safety", "Terms of Service"]
                        }
                    ].map((section, idx) => (
                        <div key={idx}>
                            <h4 className="text-[10px] font-black mb-8 text-primary uppercase tracking-[0.3em]">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all flex items-center group">
                                            {link}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black mb-8 text-primary uppercase tracking-[0.3em]">Join Our Newsletter</h4>
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                            <p className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-[0.1em]">Updates on new rentals</p>
                            <div className="flex bg-muted rounded-xl p-1.5 border border-border/50 focus-within:border-primary/50 transition-colors">
                                <input
                                    type="email"
                                    placeholder="Enter email..."
                                    className="bg-transparent border-none outline-none text-foreground px-3 py-2 text-xs flex-1 placeholder:text-muted-foreground/30"
                                />
                                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-black text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all">
                                    JOIN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} SpaceKC Rentals. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
