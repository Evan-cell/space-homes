import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { 
    Plus, Home, MessageSquare, Bell, 
    TrendingUp, Users, Settings, MoreVertical,
    Search, Filter, ChevronRight
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HouseCard from "@/components/HouseCard";
import DeleteListingButton from "@/components/DeleteListingButton";
import DashboardRecentMessages from "@/components/DashboardRecentMessages";
import { getLandlordListings, getUserStats, getConversations, getTenantSavedListings } from "@/lib/supabase-actions";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata.role as "tenant" | "landlord") || null;

    if (!role) {
        redirect("/onboarding");
    }

    // Role-aware data fetching
    const myHouses = role === "landlord" ? await getLandlordListings() : await getTenantSavedListings();
    const stats = await getUserStats();
    const recentConvs = await getConversations();

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            <div className="pt-28 pb-20 container mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>{role === "landlord" ? "Landlord Portal" : "Tenant Lounge"}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            Welcome Back, <span className="text-primary italic">{user.firstName || (role === "landlord" ? "Landlord" : "Tenant")}</span>
                        </h1>
                    </div>
                    {role === "landlord" ? (
                        <Link 
                            href="/listings/new"
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 w-fit"
                        >
                            <Plus size={18} />
                            Add New Listing
                        </Link>
                    ) : (
                        <Link 
                            href="/listings"
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 w-fit"
                        >
                            <Search size={18} />
                            Browse More Houses
                        </Link>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="bg-card border border-border p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-lg transition-shadow">
                        <div className={`w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center`}>
                            <Home size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{role === "landlord" ? "Total Listings" : "Saved Houses"}</p>
                            <h3 className="text-2xl font-black text-foreground mt-1">{myHouses.length}</h3>
                        </div>
                    </div>
                    
                    <Link href="/messages" className="bg-card border border-border p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-lg transition-shadow group">
                        <div className={`w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all`}>
                            <MessageSquare size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-emerald-500 transition-colors">{role === "landlord" ? "Active Enquiries" : "Unread Messages"}</p>
                            <h3 className="text-2xl font-black text-foreground mt-1 flex items-center gap-2">
                                {stats?.unreadEnquiries || 0}
                                {(stats?.unreadEnquiries || 0) > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                            </h3>
                        </div>
                    </Link>

                    <div className="bg-card border border-border p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-lg transition-shadow">
                        <div className={`w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center`}>
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{role === "landlord" ? "Total Views" : "Last Activity"}</p>
                            <h3 className="text-2xl font-black text-foreground mt-1">{role === "landlord" ? stats?.views || 0 : "Active"}</h3>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-lg transition-shadow">
                        <div className={`w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center`}>
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{role === "landlord" ? "Saved By" : "Profile Status"}</p>
                            <h3 className="text-2xl font-black text-foreground mt-1">{role === "landlord" ? stats?.bookmarks || 0 : "Verified"}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-foreground">{role === "landlord" ? "Your " : "Saved "} <span className="text-primary italic">{role === "landlord" ? "Listings." : "Houses."}</span></h3>
                            <div className="flex items-center gap-3">
                                <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors">
                                    <Search size={18} />
                                </button>
                                <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors">
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {myHouses.length > 0 ? myHouses.map((house: any) => (
                                <div key={house.id} className="relative group">
                                    <HouseCard {...house} />
                                    {role === "landlord" && (
                                        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-100 transition-opacity">
                                            <button className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-zinc-900 border border-zinc-200 hover:bg-white transition-all shadow-xl">
                                                <Settings size={16} />
                                            </button>
                                            <DeleteListingButton id={house.id} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Status</span>
                                            <span className="text-xs font-bold text-emerald-400">Available</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 bg-card border border-border p-20 rounded-[3rem] text-center">
                                    <p className="text-muted-foreground font-bold italic">No {role === "landlord" ? "listings" : "saved houses"} found.</p>
                                    <Link href={role === "landlord" ? "/listings/new" : "/listings"} className="inline-block mt-4 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
                                        {role === "landlord" ? "Click here to add one" : "Click here to browse houses"}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-foreground">Recent <span className="text-primary italic">Messages.</span></h3>
                            <Bell size={20} className="text-primary" />
                        </div>

                        <div className="space-y-4">
                            <DashboardRecentMessages initialConvs={recentConvs} userId={userId} userRole={role} />
                        </div>

                        <Link href="/messages" className="block w-full text-center py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">
                            View Activity Lounge
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
