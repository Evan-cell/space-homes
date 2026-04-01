"use client";

import { useState, useEffect } from "react";
import { 
    X, Phone, ShieldCheck, 
    CreditCard, Loader2, CheckCircle2, 
    AlertCircle, MessageSquare 
} from "lucide-react";
import { initiateStkPushAction, isListingUnlocked } from "@/lib/supabase-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UnlockContactModalProps {
    listingId?: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userPhone?: string;
    mode?: "listing" | "subscription";
    plan?: {
        name: string;
        price: string;
        period: string;
    };
}

export default function UnlockContactModal({ 
    listingId, 
    isOpen, 
    onClose, 
    onSuccess,
    userPhone = "",
    mode = "listing",
    plan
}: UnlockContactModalProps) {
    const [phone, setPhone] = useState(userPhone);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "initiating" | "pending" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const amount = mode === "subscription" ? parseInt(plan?.price || "0") : 50;
    const title = mode === "subscription" ? `Subscribe to ${plan?.name}` : "Unlock Contact Now.";
    const description = mode === "subscription" 
        ? `Pay KSh ${plan?.price} for ${plan?.period}ly access to all premium features.`
        : `Pay a one-time fee of KSh 50 to access landlord phone & WhatsApp details.`;

    if (!isOpen) return null;

    const handleUnlock = async () => {
        if (!phone.match(/^(254|0)(7|1)[0-9]{8}$/)) {
            toast.error("Please enter a valid M-Pesa number (e.g., 0712345678)");
            return;
        }

        setLoading(true);
        setStatus("initiating");
        setErrorMessage("");

        try {
            let res;
            if (mode === "subscription" && plan) {
                // We'll create this action next
                const { initiateSubscriptionPushAction } = await import("@/lib/supabase-actions");
                res = await initiateSubscriptionPushAction(phone, plan.name.toLowerCase().split(' ')[0], amount);
            } else {
                res = await initiateStkPushAction(listingId!, phone);
            }
            
            if (res.success) {
                setStatus("pending");
                toast.success("STK push sent to your phone. Please enter your PIN.");
                
                // Polling for status
                const interval = setInterval(async () => {
                    let confirmed = false;
                    if (mode === "subscription") {
                        // For subscriptions, we check the user's metadata or a dedicated table
                        // But since callback updates Clerk metadata, we can just refresh or wait
                        // For now, let's assume successful initiation means we're waiting for the webhook
                        // A better way is polling a 'payments' table status
                        const { getSupabaseAdmin } = await import("@/lib/supabase");
                        const { data } = await getSupabaseAdmin()
                            .from("payments")
                            .select("status")
                            .eq("checkout_request_id", res.checkoutRequestId)
                            .single();
                        if (data?.status === "completed") confirmed = true;
                    } else {
                        confirmed = await isListingUnlocked(listingId!);
                    }

                    if (confirmed) {
                        clearInterval(interval);
                        setStatus("success");
                        toast.success("Payment confirmed! Access granted.");
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                            router.refresh();
                        }, 2000);
                    }
                }, 3000);

                setTimeout(() => {
                    clearInterval(interval);
                    if (status !== "success") {
                        setStatus("error");
                        setErrorMessage("Payment timed out. If you paid, please refresh the page in a moment.");
                    }
                }, 60000);

            } else {
                setStatus("error");
                setErrorMessage(res.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            setStatus("error");
            setErrorMessage("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"
                >
                    <X size={20} className="text-muted-foreground" />
                </button>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
                            {mode === "subscription" ? <ShieldCheck size={40} /> : <CreditCard size={40} />}
                        </div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            {mode === "subscription" ? (
                                <>Subscribe <span className="text-primary italic">{plan?.name.split(' ')[0]}.</span></>
                            ) : (
                                <>Unlock Contact <span className="text-primary italic">Now.</span></>
                            )}
                        </h2>
                        <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                            {description}
                        </p>
                    </div>

                    {status === "success" ? (
                        <div className="text-center py-6 space-y-4 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto text-white shadow-xl shadow-green-500/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black text-foreground">Success!</p>
                                <p className="text-sm font-bold text-muted-foreground">
                                    {mode === "subscription" ? "Your subscription is now active." : "Contact details are now visible."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Input Area */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">M-Pesa Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                                        <Phone size={20} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="0712 345 678"
                                        className="w-full bg-muted/30 border border-border pl-16 pr-6 py-5 rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all group-hover:border-primary/50"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={status === "pending"}
                                    />
                                </div>
                            </div>

                            {/* Status Messages */}
                            {status === "pending" && (
                                <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center gap-4 animate-pulse">
                                    <Loader2 className="animate-spin text-secondary" size={20} />
                                    <p className="text-xs font-bold text-secondary-foreground">Please check your phone for the M-Pesa PIN prompt.</p>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4">
                                    <AlertCircle className="text-red-500" size={20} />
                                    <p className="text-xs font-bold text-red-600">{errorMessage}</p>
                                </div>
                            )}

                            {/* Action Button */}
                            <button 
                                onClick={handleUnlock}
                                disabled={loading || status === "pending" || !phone}
                                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {loading || status === "pending" ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        {status === "initiating" ? "Initiating..." : "Waiting for PIN..."}
                                    </>
                                ) : (
                                    <>
                                        <span>Confirm Payment</span>
                                        <ShieldCheck className="group-hover:translate-x-1 transition-transform" size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-border/50 text-center">
                        <div className="flex items-center justify-center gap-3 text-muted-foreground">
                            <ShieldCheck size={14} className="text-secondary" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Secure Payment via Daraja</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
