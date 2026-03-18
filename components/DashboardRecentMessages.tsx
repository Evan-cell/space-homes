"use client";

import { useState } from "react";
import { MessageSquare, ChevronRight, X, Send, Clock, User } from "lucide-react";
import Link from "next/link";
import { sendMessage, markMessagesAsRead } from "@/lib/supabase-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
    full_name: string | null;
    avatar_url: string | null;
}

interface LastMessage {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
}

interface Conversation {
    id: string;
    tenant_id: string;
    landlord_id: string;
    listing_id: string;
    updated_at: string;
    tenant: Profile | null;
    landlord: Profile | null;
    unreadCount: number;
    lastMessage: LastMessage | null;
}

interface DashboardRecentMessagesProps {
    initialConvs: Conversation[];
    userId: string;
    userRole: "tenant" | "landlord";
}

export default function DashboardRecentMessages({ initialConvs, userId, userRole }: DashboardRecentMessagesProps) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConvs);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Filter for unread messages first, then sort by updated_at
    const unreadConvs = conversations.filter(c => c.unreadCount > 0);
    const displayConvs = unreadConvs.length > 0 ? unreadConvs : conversations.slice(0, 5);

    const handleOpenReply = async (conv: any) => {
        setSelectedConv(conv);
        // Mark as read immediately when opening the quick reply
        await markMessagesAsRead(conv.id);
        // Update local state to reflect read status
        setConversations(prev => prev.map(c => 
            c.id === conv.id ? { ...c, unreadCount: 0 } : c
        ));
    };

    const handleSendReply = async () => {
        if (!reply.trim() || !selectedConv) return;
        
        setLoading(true);
        try {
            const receiverId = userId === selectedConv.tenant_id ? selectedConv.landlord_id : selectedConv.tenant_id;
            await sendMessage(receiverId, reply, selectedConv.listing_id);
            toast.success("Reply sent!");
            setSelectedConv(null);
            setReply("");
            router.refresh(); // Refresh dashboard stats
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {displayConvs.length > 0 ? (
                displayConvs.map((conv) => {
                    const partner = userRole === "landlord" ? conv.tenant : conv.landlord;
                    return (
                        <div 
                            key={conv.id} 
                            onClick={() => handleOpenReply(conv)}
                            className="bg-card border border-border p-5 rounded-3xl flex gap-4 hover:border-primary/30 transition-colors group cursor-pointer relative"
                        >
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all overflow-hidden relative">
                                {partner?.avatar_url ? (
                                    <Image src={partner.avatar_url} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <MessageSquare size={20} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                    {partner?.full_name || "SpaceKC User"} 
                                    <span className="font-medium text-muted-foreground ml-1">
                                        {conv.unreadCount > 0 ? "sent a new message" : "messaged you"}
                                    </span>
                                </p>
                                <p className={`text-xs truncate italic mt-0.5 ${conv.unreadCount > 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                                    "{conv.lastMessage?.content}"
                                </p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="absolute top-4 right-10 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary mt-1" />
                        </div>
                    );
                })
            ) : (
                <div className="bg-card border border-border p-12 rounded-3xl text-center">
                    <p className="text-muted-foreground font-bold">No messages yet.</p>
                </div>
            )}

            {/* Quick Reply Modal */}
            {selectedConv && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedConv(null)}
                    />
                    <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        {(() => {
                            const partner = userRole === "landlord" ? selectedConv.tenant : selectedConv.landlord;
                            return (
                                <>
                                <div className="p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden relative">
                                            {partner?.avatar_url ? (
                                                <Image src={partner.avatar_url} alt="Profile" fill className="object-cover" />
                                            ) : (
                                                <User size={24} className="text-primary" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-foreground">{partner?.full_name || "SpaceKC User"}</h3>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Replying to {userRole === "landlord" ? "enquiry" : "landlord"}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedConv(null)}
                                        className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                </>
                            );
                        })()}

                        {/* Last Message Context */}
                        <div className="p-6 bg-muted/30">
                            <div className="bg-card p-4 rounded-2xl border border-border">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Last Message</p>
                                <p className="text-sm font-bold text-foreground">"{selectedConv.lastMessage?.content}"</p>
                            </div>
                        </div>

                        {/* Reply Form */}
                        <div className="p-6 space-y-4">
                            <textarea 
                                className="w-full bg-muted/50 border border-border p-5 rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[150px] resize-none"
                                placeholder="Type your reply here..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                autoFocus
                            />
                            
                            <div className="flex gap-3">
                                <Link 
                                    href={`/messages?conversationId=${selectedConv.id}`}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-center hover:bg-muted transition-all"
                                >
                                    Open Full Chat
                                </Link>
                                <button 
                                    onClick={handleSendReply}
                                    disabled={loading || !reply.trim()}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? "Sending..." : (
                                        <>
                                            <Send size={14} />
                                            Send Reply
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
