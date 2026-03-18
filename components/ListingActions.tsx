"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Heart } from "lucide-react";
import { trackListingView, toggleBookmark, isBookmarked, sendMessage } from "@/lib/supabase-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ListingActionsProps {
    listingId: string;
    landlordId: string;
    isOwner: boolean;
    isUnlocked: boolean;
}

export default function ListingActions({ listingId, landlordId, isOwner, isUnlocked }: ListingActionsProps) {
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showInput, setShowInput] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Track view on mount
        if (!isOwner) {
            trackListingView(listingId);
        }
        
        // Initial bookmark state
        const checkBookmark = async () => {
            const status = await isBookmarked(listingId);
            setBookmarked(status);
        };
        checkBookmark();
    }, [listingId, isOwner]);

    const handleBookmark = async () => {
        try {
            const { bookmarked: newStatus } = await toggleBookmark(listingId);
            setBookmarked(newStatus);
            toast.success(newStatus ? "Added to saved" : "Removed from saved");
        } catch (error) {
            toast.error("Please sign in to save properties");
        }
    };

    const handleMessage = async () => {
        if (isOwner) {
            toast.error("You cannot message yourself");
            return;
        }

        if (!isUnlocked) {
            toast.error("Please unlock the listing to message the landlord");
            return;
        }

        if (!showInput) {
            setShowInput(true);
            return;
        }

        if (!message.trim()) {
            toast.error("Please type a message first");
            return;
        }

        setLoading(true);
        try {
            console.log("SENDING MESSAGE FROM UI...", { landlordId, message, listingId });
            const res = await sendMessage(landlordId, message, listingId);
            if (res.success) {
                toast.success("Message sent! Taking you to chat...");
                router.push(`/messages?conversationId=${res.conversationId}`);
            }
        } catch (error) {
            const err = error as any;
            console.error("UI SEND ERROR:", err);
            toast.error(err.message || "Failed to start conversation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {showInput && !isOwner && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-card border border-border p-4 rounded-3xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Write your message</p>
                    <textarea 
                        className="w-full bg-muted/30 border border-border p-4 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] mb-3"
                        placeholder="Hi, I'm interested in this property! Is it still available?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowInput(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleMessage}
                            disabled={loading || !message.trim()}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Now"}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 relative">
                {!isOwner && (
                    <button 
                        onClick={handleMessage}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-sm font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 ${
                            showInput ? "bg-primary/10 text-primary border border-primary/20" : 
                            !isUnlocked ? "bg-muted text-muted-foreground border-border" : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                        }`}
                    >
                        <MessageSquare size={18} />
                        <span>{loading ? "Connecting..." : showInput ? "Click Send Now" : !isUnlocked ? "Unlock to Message" : "Message Landlord"}</span>
                    </button>
                )}
                
                <button 
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all text-sm font-black uppercase tracking-widest active:scale-95 ${
                        bookmarked 
                        ? "bg-red-500/10 border-red-500 text-red-500" 
                        : "bg-card border-border hover:bg-muted text-foreground"
                    }`}
                >
                    <Heart size={18} className={bookmarked ? "fill-red-500" : ""} />
                    <span>{bookmarked ? "Saved" : "Save"}</span>
                </button>
            </div>
        </div>
    );
}
