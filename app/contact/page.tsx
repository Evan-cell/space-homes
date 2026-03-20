"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const contactDetails = [
    {
        icon: Mail,
        label: "Email Us",
        value: "malcomchege0582@gmail.com",
        href: "mailto:malcomchege0582@gmail.com",
    },
    {
        icon: Phone,
        label: "Call Us",
        value: "+254 700 000 000",
        href: "tel:+254700000000",
    },
    {
        icon: MapPin,
        label: "Based In",
        value: "Nairobi, Kenya",
        href: "https://maps.google.com/?q=Nairobi,Kenya",
    },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to send message.");

            setSent(true);
            setForm({ name: "", email: "", message: "" });
        } catch {
            toast.error("Failed to send your message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />

            {/* Page Header */}
            <section className="pt-40 pb-20 px-6 container mx-auto max-w-5xl text-center">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Get In Touch</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mt-4 mb-6 leading-[1.05]">
                    We&apos;d Love to <span className="text-primary italic">Hear From You.</span>
                </h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                    Have a question, partnership idea, or just want to say hi? Send us a message and we&apos;ll get back to you as soon as possible.
                </p>
            </section>

            <section className="pb-32 px-6">
                <div className="container mx-auto max-w-5xl grid md:grid-cols-5 gap-12">

                    {/* Left: Contact Details */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-foreground mb-2">Contact <span className="text-primary italic">Info.</span></h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">Reach us through any of the options below or use the form.</p>
                        </div>

                        {contactDetails.map(({ icon: Icon, label, value, href }) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith("http") ? "_blank" : undefined}
                                rel="noopener noreferrer"
                                className="flex items-center gap-5 p-5 bg-card border border-border rounded-3xl group hover:border-primary/30 transition-all hover:shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                                    <p className="font-bold text-foreground text-sm">{value}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Right: Contact Form */}
                    <div className="md:col-span-3">
                        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
                                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle className="text-green-500" size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground mb-2">Message Sent!</h3>
                                        <p className="text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                                    </div>
                                    <button
                                        onClick={() => setSent(false)}
                                        className="mt-4 px-8 py-3 rounded-full border border-border text-sm font-black uppercase tracking-widest hover:bg-muted transition-all"
                                    >
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground mb-1">Send a <span className="text-primary italic">Message.</span></h2>
                                        <p className="text-muted-foreground text-sm">We typically respond within 24 hours.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. John Kamau"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-muted/40 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground placeholder:text-muted-foreground/40"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="e.g. john@gmail.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full bg-muted/40 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground placeholder:text-muted-foreground/40"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                                        <textarea
                                            placeholder="What would you like to tell us?"
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            className="w-full bg-muted/40 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground placeholder:text-muted-foreground/40 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 disabled:opacity-60"
                                    >
                                        <Send size={16} />
                                        {loading ? "Sending..." : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
