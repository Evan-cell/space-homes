"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Heart, CheckCircle2 } from "lucide-react";
import { trackListingView, toggleBookmark, isBookmarked, sendMessage } from "@/lib/supabase-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ListingActionsProps {
    listingId: string;
    landlordId: string;
    isOwner: boolean;
}

export default function ListingActions({ listingId, landlordId, isOwner }: ListingActionsProps) {
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
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
            toast.success(newStatus ? "Added to shortlist" : "Removed from shortlist");
        } catch (error) {
            toast.error("Please sign in to shortlist properties");
        }
    };

    const handleMessage = async () => {
        if (isOwner) {
            toast.error("You cannot message yourself");
            return;
        }

        setLoading(true);
        try {
            // Initial message to start conversation
            const res = await sendMessage(landlordId, "Hi, I'm interested in this property!", listingId);
            if (res.success) {
                toast.success("Conversation started!");
                router.push(`/messages?conversationId=${res.conversationId}`);
            }
        } catch (error) {
            toast.error("Failed to start conversation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            {!isOwner && (
               <button 
                  onClick={handleMessage}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all text-sm font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
               >
                  <MessageSquare size={18} />
                  <span>{loading ? "Starting Chat..." : "Message Landlord"}</span>
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
                <span>{bookmarked ? "Shortlisted" : "Shortlist"}</span>
            </button>
        </div>
    );
}
