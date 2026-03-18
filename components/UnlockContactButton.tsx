"use client";

import { useState } from "react";
import { Lock, Smartphone } from "lucide-react";
import UnlockContactModal from "./UnlockContactModal";
import { toast } from "sonner";

interface UnlockContactButtonProps {
    listingId: string;
    isOwner: boolean;
}

export default function UnlockContactButton({ listingId, isOwner }: UnlockContactButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isOwner) return null;

    return (
        <div className="space-y-4">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group"
            >
                <Lock size={20} className="group-hover:rotate-12 transition-transform" />
                Unlock Contact Details
            </button>
            <div className="flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
                <Smartphone size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">One-time Ksh 50 via M-Pesa</span>
            </div>

            <UnlockContactModal 
                listingId={listingId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    toast.success("Unlocked! You can now view contact details.");
                }}
            />
        </div>
    );
}
