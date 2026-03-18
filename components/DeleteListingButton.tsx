"use client";

import { Trash2 } from "lucide-react";
import { deleteListing } from "@/lib/supabase-actions";
import { toast } from "sonner";
import { useState } from "react";

export default function DeleteListingButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        // Removed confirmation as per user request
        setLoading(true);
        try {
            const result = await deleteListing(id);
            if (result.success) {
                toast.success("Listing deleted successfully");
            }
        } catch (error) {
            toast.error("Failed to delete listing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={loading}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-red-500 border border-red-100 hover:bg-red-50 transition-all shadow-xl disabled:opacity-50"
            title="Delete Listing"
        >
            <Trash2 size={16} className={loading ? "animate-pulse" : ""} />
        </button>
    );
}
