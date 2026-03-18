"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabase, getSupabaseAdmin } from "./supabase";
import { revalidatePath } from "next/cache";

export async function createListing(formData: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Ensure profile exists in Supabase (fallback sync)
    const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

    if (!profile) {
        console.log("Profile missing for user", userId, "attempting to sync...");
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const email = user.emailAddresses[0]?.emailAddress;
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const avatarUrl = user.imageUrl;
        const role = (user.publicMetadata.role as "tenant" | "landlord") || "landlord";

        await getSupabaseAdmin()
            .from("profiles")
            .upsert({
                id: userId,
                email,
                full_name: fullName,
                avatar_url: avatarUrl,
                role,
                updated_at: new Date().toISOString(),
            });
    }

    const { error } = await getSupabaseAdmin()
        .from("listings")
        .insert({
            landlord_id: userId,
            title: formData.title,
            price: formData.price,
            price_value: parseFloat(formData.priceValue),
            location: formData.location,
            type: formData.type,
            description: formData.description,
            amenities: formData.amenities || [],
            images: formData.images || [],
            bedrooms: formData.bedrooms || 1,
            bathrooms: formData.bathrooms || 1,
            space_size: formData.spaceSize ? String(formData.spaceSize) : null,
            phone_number: formData.phoneNumber || null,
            rating: 0,
        });

    if (error) {
        console.error("Error creating listing:", JSON.stringify(error, null, 2));
        throw new Error("Failed to create listing");
    }

    revalidatePath("/listings");
    revalidatePath("/dashboard");
    
    return { success: true };
}

export async function getListings() {
    const { data, error } = await supabase
        .from("listings")
        .select(`
            *,
            landlord:profiles (
                full_name,
                phone,
                whatsapp,
                verified
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching listings:", error);
        return [];
    }

    // Map to match the existing PROPERTIES structure if needed
    return data.map(item => ({
        ...item,
        priceValue: item.price_value,
        landlord: {
            name: item.landlord?.full_name || "Unknown Landlord",
            phone: item.landlord?.phone || "",
            whatsapp: item.landlord?.whatsapp || "",
            verified: item.landlord?.verified || false
        }
    }));
}

export async function getLandlordListings() {
    const { userId } = await auth();
    if (!userId) return [];

    const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("landlord_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching landlord listings:", JSON.stringify(error, null, 2));
        return [];
    }

    return data.map(item => ({
        ...item,
        priceValue: item.price_value,
    }));
}

export async function deleteListing(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { error } = await getSupabaseAdmin()
        .from("listings")
        .delete()
        .eq("id", id)
        .eq("landlord_id", userId);

    if (error) {
        console.error("Error deleting listing:", error);
        throw new Error("Failed to delete listing");
    }

    revalidatePath("/listings");
    revalidatePath("/dashboard");
    
    return { success: true };
}

export async function getListingById(id: string) {
    const { data, error } = await getSupabaseAdmin()
        .from("listings")
        .select(`
            *,
            landlord:profiles (
                full_name,
                phone,
                whatsapp,
                verified
            )
        `)
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching listing by ID:", id, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        return null;
    }

    return {
        ...data,
        priceValue: data.price_value,
        spaceSize: data.space_size,
        phoneNumber: data.phone_number,
        landlord: {
            name: data.landlord?.full_name || "Unknown Landlord",
            phone: data.phone_number || data.landlord?.phone || "",
            whatsapp: data.phone_number || data.landlord?.whatsapp || "",
            verified: data.landlord?.verified || false
        }
    };
}

export async function trackListingView(listingId: string) {
    const { userId } = await auth();
    
    // We using admin to bypass RLS for views
    await getSupabaseAdmin()
        .from("listing_views")
        .insert({
            listing_id: listingId,
            viewer_id: userId || null
        });
}

export async function toggleBookmark(listingId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = getSupabaseAdmin();
    
    // Check if already bookmarked
    const { data: existing } = await admin
        .from("bookmarks")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", userId)
        .single();

    if (existing) {
        await admin.from("bookmarks").delete().eq("id", existing.id);
        return { bookmarked: false };
    } else {
        await admin.from("bookmarks").insert({ listing_id: listingId, user_id: userId });
        return { bookmarked: true };
    }
}

export async function isBookmarked(listingId: string) {
    const { userId } = await auth();
    if (!userId) return false;

    const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", userId)
        .single();

    return !!data;
}

export async function getLandlordStats() {
    const { userId } = await auth();
    if (!userId) return { views: 0, bookmarks: 0, unreadEnquiries: 0 };

    const admin = getSupabaseAdmin();

    // 1. Get total views for all landlord's listings
    const { data: listings } = await admin
        .from("listings")
        .select("id")
        .eq("landlord_id", userId);
    
    const listingIds = listings?.map(l => l.id) || [];

    if (listingIds.length === 0) return { views: 0, bookmarks: 0, unreadEnquiries: 0 };

    const { count: views } = await admin
        .from("listing_views")
        .select("*", { count: 'exact', head: true })
        .in("listing_id", listingIds);

    // 2. Get total bookmarks
    const { count: bookmarks } = await admin
        .from("bookmarks")
        .select("*", { count: 'exact', head: true })
        .in("listing_id", listingIds);

    // 3. Get unread messages count
    const { count: unreadEnquiries } = await admin
        .from("messages")
        .select("id", { count: 'exact', head: true })
        .eq("is_read", false)
        .neq("sender_id", userId)
        .in("conversation_id", (
            await admin.from("conversations").select("id").eq("landlord_id", userId)
        ).data?.map(c => c.id) || []);

    return {
        views: views || 0,
        bookmarks: bookmarks || 0,
        unreadEnquiries: unreadEnquiries || 0
    };
}

export async function sendMessage(receiverId: string, content: string, listingId?: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = getSupabaseAdmin();

    // Find or create conversation
    let { data: conv } = await admin
        .from("conversations")
        .select("id")
        .or(`and(tenant_id.eq.${userId},landlord_id.eq.${receiverId}),and(tenant_id.eq.${receiverId},landlord_id.eq.${userId})`)
        .single();

    if (!conv) {
        const { data: newConv } = await admin
            .from("conversations")
            .insert({
                tenant_id: userId, // Assuming first messager is tenant or we determine by role
                landlord_id: receiverId,
                listing_id: listingId
            })
            .select()
            .single();
        conv = newConv;
    }

    if (!conv) throw new Error("Failed to create conversation");

    const { error } = await admin
        .from("messages")
        .insert({
            conversation_id: conv.id,
            sender_id: userId,
            content
        });

    if (error) throw error;

    // Update conversation updated_at
    await admin.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conv.id);

    revalidatePath("/messages");
    return { success: true, conversationId: conv.id };
}

export async function getConversations() {
    const { userId } = await auth();
    if (!userId) {
        console.log("No userId found in getConversations");
        return [];
    }

    // Simplify query for debugging
    const { data, error } = await getSupabaseAdmin()
        .from("conversations")
        .select(`
            *,
            listing:listings (title, images),
            tenant:profiles!tenant_id (full_name, avatar_url),
            landlord:profiles!landlord_id (full_name, avatar_url),
            last_message:messages (content, created_at, is_read, sender_id)
        `)
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("FULL SUPABASE ERROR:", JSON.stringify(error, null, 2));
        return [];
    }

    if (!data) return [];

    return data.map(c => ({
        ...c,
        unreadCount: Array.isArray(c.last_message) ? c.last_message.filter((m: any) => !m.is_read && m.sender_id !== userId).length : 0,
        lastMessage: Array.isArray(c.last_message) && c.last_message.length > 0 ? c.last_message[c.last_message.length - 1] : null
    }));
}

export async function getMessages(conversationId: string) {
    const { userId } = await auth();
    if (!userId) return [];

    const { data, error } = await getSupabaseAdmin()
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

    if (error) return [];

    // Mark as read
    await getSupabaseAdmin()
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);

    return data;
}
