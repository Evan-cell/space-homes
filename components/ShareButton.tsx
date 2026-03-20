"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Copy, Check, X } from "lucide-react";

interface ShareButtonProps {
    listingId: string;
    title: string;
}

export default function ShareButton({ listingId, title }: ShareButtonProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/listings/${listingId}`
        : `https://www.spacekc.com/listings/${listingId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for older browsers
            const el = document.createElement("textarea");
            el.value = shareUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 md:px-4 py-3 rounded-xl bg-card border border-border hover:bg-muted transition-all text-sm font-bold ml-1 md:ml-2"
            >
                <Share2 size={16} className="text-primary" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-card border border-border rounded-3xl shadow-2xl z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-black text-foreground">Share this Listing</p>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                        >
                            <X size={14} className="text-muted-foreground" />
                        </button>
                    </div>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Listing Link</p>
                    <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-2xl p-3">
                        <p className="text-xs font-bold text-foreground flex-1 truncate">{shareUrl}</p>
                        <button
                            onClick={handleCopy}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                copied
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                            }`}
                        >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this rental on SpaceKC: ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-[11px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this rental on SpaceKC: ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[11px] font-black uppercase tracking-widest hover:bg-sky-500/20 transition-all"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.634zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            Twitter / X
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
