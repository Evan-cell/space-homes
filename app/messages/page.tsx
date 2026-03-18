"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import { getConversations, getMessages, sendMessage, markMessagesAsRead } from "@/lib/supabase-actions";
import { useUser } from "@clerk/nextjs";
import { Send, Search, User, Home, Clock, MessageSquare, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";


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

interface Listing {
    title: string;
    images: string[];
}

interface Conversation {
    id: string;
    tenant_id: string;
    landlord_id: string;
    listing_id: string;
    updated_at: string;
    tenant: Profile | null;
    landlord: Profile | null;
    listing: Listing | null;
    unreadCount: number;
    lastMessage: LastMessage | null;
}

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

function MessagesContent() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadConversations = async (selectId?: string) => {
        const data = await getConversations();
        const typedData = data as unknown as Conversation[];
        setConversations(typedData);
        
        if (selectId) {
            const found = typedData.find(c => c.id === selectId);
            if (found) setActiveConv(found);
        } else if (typedData.length > 0 && !activeConv) {
            setActiveConv(typedData[0]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const id = searchParams.get("conversationId");
        loadConversations(id || undefined);
    }, [searchParams]);

    // Realtime Subscriptions
    useEffect(() => {
        if (!user) return;

        const messageChannel = supabase
            .channel('messages_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new as Message;
                    if (activeConv && newMsg.conversation_id === activeConv.id) {
                        setMessages(prev => {
                            if (prev.find(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                        setTimeout(scrollToBottom, 50);
                    }
                    loadConversations(activeConv?.id);
                }
            )
            .subscribe();

        const convChannel = supabase
            .channel('conv_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                () => {
                    loadConversations(activeConv?.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(convChannel);
        };
    }, [user, activeConv]);

    const loadMessages = async (convId: string) => {
        const msgs = await getMessages(convId);
        setMessages(msgs);
        setTimeout(scrollToBottom, 50);
        await markMessagesAsRead(convId);
        loadConversations(convId);
    };

    useEffect(() => {
        if (activeConv) {
            loadMessages(activeConv.id);
        }
    }, [activeConv]);

    useEffect(() => {
        if (!user || !activeConv) return;
        const channel = supabase
            .channel(`active_chat_${activeConv.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
                async () => {
                    await markMessagesAsRead(activeConv.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, activeConv]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || sending) return;

        setSending(true);
        const content = newMessage;
        setNewMessage("");
        
        try {
            const receiverId = user?.id === activeConv.tenant_id ? activeConv.landlord_id : activeConv.tenant_id;
            await sendMessage(receiverId, content, activeConv.listing_id);
        } catch (error) {
            toast.error("Failed to send message");
            setNewMessage(content); // Restore message on failure
        } finally {
            setSending(false);
            setTimeout(scrollToBottom, 50);
        }
    };

    if (loading && conversations.length === 0) {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-40 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-black uppercase tracking-widest text-xs text-muted-foreground">Loading Conversations...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 pt-24 pb-12 container mx-auto px-6 max-w-7xl flex gap-8 h-[calc(100vh-100px)]">
                {/* Sidebar */}
                <div className={`w-full md:w-80 bg-card border border-border rounded-[2.5rem] flex flex-col overflow-hidden shrink-0 ${
                    activeConv ? "hidden md:flex" : "flex"
                }`}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-black text-foreground mb-4">Messages</h2>
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Search chats..."
                                className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black uppercase tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-xs font-bold text-muted-foreground">No conversations yet.</p>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isTenant = user?.id === conv.tenant_id;
                                const partner = isTenant ? conv.landlord : conv.tenant;
                                const isActive = activeConv?.id === conv.id;
                                
                                return (
                                    <button 
                                        key={conv.id}
                                        onClick={() => setActiveConv(conv)}
                                        className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all text-left group ${
                                            isActive ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 font-black uppercase tracking-widest" : "hover:bg-muted font-bold"
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 border-2 border-background overflow-hidden relative">
                                            {partner?.avatar_url ? (
                                                <Image src={partner.avatar_url} alt={partner.full_name || "User"} fill className="object-cover" />
                                            ) : (
                                                <User size={20} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                                            )}
                                            {conv.unreadCount > 0 && !isActive && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="font-black text-sm truncate">{(partner?.full_name) || "SpaceKC User"}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                    {conv.lastMessage ? formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: false }).replace('about ', '') : ""}
                                                </p>
                                            </div>
                                            <p className={`text-xs truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                                {conv.lastMessage?.sender_id === user?.id ? "You: " : ""}{conv.lastMessage?.content || "No messages yet"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`flex-1 flex-col bg-card border border-border rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-primary/5 ${
                    activeConv ? "flex" : "hidden md:flex"
                }`}>
                    {activeConv ? (
                        <>
                            <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setActiveConv(null)} className="md:hidden p-2 hover:bg-muted rounded-full transition-all">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center border border-border">
                                        <User size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm md:text-base text-foreground">
                                            {(user?.id === activeConv.tenant_id ? activeConv.landlord?.full_name : activeConv.tenant?.full_name) || "SpaceKC User"}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                                {activeConv.listing && (
                                    <div className="flex items-center gap-3 bg-muted/40 p-2 pr-4 rounded-2xl border border-border">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden relative">
                                            <Image src={activeConv.listing.images?.[0] || ""} alt={activeConv.listing.title} fill className="object-cover" />
                                        </div>
                                        <div className="hidden lg:block">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Enquiry For</p>
                                            <p className="text-xs font-bold truncate max-w-[150px]">{activeConv.listing.title}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 flex flex-col">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                        <Clock size={40} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No messages yet. Say hi!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[85%] md:max-w-[70%]`}>
                                                    <div className={`p-3 md:p-4 rounded-2xl md:rounded-[2rem] text-sm leading-relaxed ${
                                                        isMe ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" : "bg-muted text-foreground rounded-tl-none font-bold"
                                                    }`}>
                                                        <p className={isMe ? "" : ""}>{msg.content}</p>
                                                    </div>
                                                    <p className={`text-[10px] mt-2 font-black uppercase tracking-widest text-muted-foreground ${isMe ? "text-right" : "text-left"}`}>
                                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-4 md:p-6 bg-card border-t border-border mt-auto">
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        placeholder="Type your message..."
                                        className="w-full bg-muted/50 border border-border px-6 md:px-8 py-4 md:py-5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-sm pr-16 md:pr-20 uppercase tracking-widest"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center text-primary/30 animate-pulse">
                                <MessageSquare size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-foreground">Select a conversation</h3>
                                <p className="text-muted-foreground font-black uppercase tracking-widest mt-2 text-xs">Pick a chat from the sidebar to start messaging.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
            </main>
        }>
            <MessagesContent />
        </Suspense>
    );
}
