import { getListingById } from "@/lib/supabase-actions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
    MapPin,
    ShieldCheck, Phone, MessageSquare, 
    CheckCircle2, ArrowLeft, BedDouble, 
    Bath, Ruler
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import DeleteListingButton from "@/components/DeleteListingButton";
import ListingActions from "@/components/ListingActions";
import { isListingUnlocked } from "@/lib/supabase-actions";
import UnlockContactButton from "@/components/UnlockContactButton";
import ListingImageGallery from "@/components/ListingImageGallery";
import ShareButton from "@/components/ShareButton";

export default async function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const property = await getListingById(id);

    if (!property) {
        notFound();
    }

    const { userId } = await auth();
    const client = await clerkClient();
    const user = userId ? await client.users.getUser(userId) : null;
    const isOwner = userId === property.landlord_id;
    const isUnlocked = await isListingUnlocked(id);
    
    // Check subscription status with expiry
    const subscriptionExpiry = user?.publicMetadata?.subscriptionExpiry as string;
    const isSubscribed = user?.publicMetadata?.isSubscribed === true && 
                        (!subscriptionExpiry || new Date(subscriptionExpiry) > new Date());
                        
    const isTenant = user?.publicMetadata?.role === "tenant";
    
    // Gated content logic: Hide for non-subscribed tenants if not explicitly unlocked
    const showGatedContent = isOwner || isSubscribed || isUnlocked;

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />

            {/* Back Button & Actions */}
            <div className="pt-28 pb-6 container mx-auto px-4 md:px-6 flex items-center justify-between">
                <Link href="/listings" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-sm font-bold hidden sm:inline">Back to Search</span>
                </Link>
                <div className="flex items-center gap-2 md:gap-3">
                    {isOwner && (
                        <div className="mr-0 md:mr-2">
                            <DeleteListingButton id={property.id} />
                        </div>
                    )}
                    <ListingActions 
                        listingId={property.id} 
                        landlordId={property.landlord_id} 
                        isOwner={isOwner}
                        isUnlocked={isUnlocked}
                    />
                    <ShareButton listingId={property.id} title={property.title} />
                </div>
            </div>

            {/* Image Gallery Hub */}
            <ListingImageGallery 
                images={property.images || []} 
                title={property.title} 
                rating={property.rating} 
            />

            <div className="container mx-auto px-4 md:px-6 pb-24 lg:grid lg:grid-cols-3 lg:gap-16">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8 md:space-y-12">
                    {/* Core Info */}
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{property.type}</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin size={14} className="text-secondary" />
                                <span className="text-sm font-bold">{property.location}</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1]">{property.title}</h1>
                    </div>

                    {/* Features Row */}
                    <div className="flex flex-wrap gap-4 md:gap-8 items-center border-b border-border pb-6 md:pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-muted flex items-center justify-center text-primary"><BedDouble size={20} className="md:w-[24px]" /></div>
                            <div><p className="text-[10px] font-black uppercase text-muted-foreground">Bedrooms</p><p className="font-bold text-sm md:text-base">{property.bedrooms || 1} {property.bedrooms === 1 ? 'Room' : 'Rooms'}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-muted flex items-center justify-center text-primary"><Bath size={20} className="md:w-[24px]" /></div>
                            <div><p className="text-[10px] font-black uppercase text-muted-foreground">Bathrooms</p><p className="font-bold text-sm md:text-base">{property.bathrooms || 1} {property.bathrooms === 1 ? 'Unit' : 'Units'}</p></div>
                        </div>
                        {property.spaceSize && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-muted flex items-center justify-center text-primary"><Ruler size={20} className="md:w-[24px]" /></div>
                                <div><p className="text-[10px] font-black uppercase text-muted-foreground">Space</p><p className="font-bold text-sm md:text-base">{property.spaceSize} sqft</p></div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-foreground">Property <span className="text-primary italic">Description.</span></h3>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-wrap">
                            {property.description}
                        </p>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-foreground">Premium <span className="text-primary italic">Amenities.</span></h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {property.amenities?.map((amenity: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 group hover:bg-muted transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="font-bold text-foreground text-sm">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location & Map */}
                    <div className="space-y-8 pt-6">
                        <h3 className="text-xl font-black text-foreground">Location <span className="text-primary italic">Overview.</span></h3>
                        <div className="bg-card border border-border p-3 md:p-6 rounded-[3rem] shadow-2xl shadow-primary/5 relative overflow-hidden group min-h-[300px]">
                            {/* Embedded Google Map */}
                            <div className={`aspect-[4/3] md:aspect-[21/9] w-full rounded-[2rem] overflow-hidden bg-muted/30 relative border border-border/50 ${!showGatedContent ? 'blur-xl grayscale opacity-50' : ''}`}>
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    loading="lazy" 
                                    allowFullScreen 
                                    referrerPolicy="no-referrer-when-downgrade" 
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                ></iframe>
                            </div>
                            
                            {/* Premium Overlay Button if landlord provided exact pin */}
                            {property.map_url && showGatedContent && (
                                <div className="absolute inset-x-0 bottom-0 p-8 flex justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none rounded-b-[3rem]">
                                    <a 
                                        href={property.map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pointer-events-auto flex items-center gap-3 bg-primary text-primary-foreground py-4 px-8 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all outline outline-4 outline-white/20 dark:outline-black/20"
                                    >
                                        <MapPin size={18} />
                                        Open Exact Pin in Maps 
                                    </a>
                                </div>
                            )}

                            {!showGatedContent && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-background/20 backdrop-blur-sm">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
                                        <MapPin size={32} />
                                    </div>
                                    <h4 className="text-xl font-black text-foreground mb-2">Unlock House Pin Location</h4>
                                    <p className="text-xs font-bold text-muted-foreground max-w-[240px] mb-6">Subscribe to view the exact location and navigate to this property.</p>
                                    <Link 
                                        href="/subscription"
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Get Full Access
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Contact Sidebar */}
                <div className="mt-8 md:mt-12 lg:mt-0">
                    <div className="lg:sticky lg:top-32 bg-card border border-border p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-primary/5 space-y-6 md:space-y-8">
                        <div className="space-y-1 md:space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monthly Rent</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl md:text-4xl font-black text-primary">{property.price}</h2>
                                <span className="text-sm md:text-base text-muted-foreground font-bold">/ month</span>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Landlord Card */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg">
                                {property.landlord?.name?.[0] || "L"}
                            </div>
                            <div>
                                <h4 className="font-black text-foreground">{property.landlord?.name}</h4>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-secondary" />
                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                                        {property.landlord?.verified ? "Verified Landlord" : "Registered Landlord"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Buttons or Unlock Prompt */}
                        {!isOwner && (
                            <div className="space-y-3 relative">
                                {!showGatedContent && (
                                    <div className="absolute inset-x-0 top-0 z-10 p-6 flex flex-col items-center justify-center bg-card/80 backdrop-blur-md rounded-2xl border border-primary/20 shadow-xl">
                                        <Phone size={24} className="text-primary mb-3 animate-pulse" />
                                        <Link 
                                            href="/subscription"
                                            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Unlock Contact Details
                                        </Link>
                                    </div>
                                )}
                                
                                <div className={!showGatedContent ? "blur-md select-none pointer-events-none opacity-40 shrink-0" : ""}>
                                    <a 
                                        href={`tel:${property.landlord?.phone?.replace(/\s+/g, '')}`}
                                        className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 mb-3"
                                    >
                                        <Phone size={18} />
                                        Call Landlord
                                    </a>
                                    <a 
                                        href={`https://wa.me/${property.landlord?.whatsapp?.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-green-500/30 active:scale-95"
                                    >
                                        <MessageSquare size={18} />
                                        Chat WhatsApp
                                    </a>
                                </div>
                            </div>
                        )}

                        <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                            Always visit the property in person before making any payments. Report suspicious listings to our help desk.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
