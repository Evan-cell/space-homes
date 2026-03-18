"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabase, getSupabaseAdmin } from "./supabase";
import { revalidatePath } from "next/cache";

export async function createListing(formData: Record<string, unknown>) {
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
            title: formData.title as string,
            price: formData.price as string,
            price_value: parseFloat(formData.priceValue as string),
            location: formData.location as string,
            type: formData.type as string,
            description: formData.description as string,
            amenities: (formData.amenities as string[]) || [],
            images: (formData.images as string[]) || [],
            bedrooms: (formData.bedrooms as number) || 1,
            bathrooms: (formData.bathrooms as number) || 1,
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

export async function getUserStats() {
    const { userId } = await auth();
    if (!userId) return { views: 0, bookmarks: 0, unreadEnquiries: 0 };

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role as "tenant" | "landlord";
    
    const admin = getSupabaseAdmin();

    if (role === "landlord") {
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

        const { count: bookmarks } = await admin
            .from("bookmarks")
            .select("*", { count: 'exact', head: true })
            .in("listing_id", listingIds);

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
    } else {
        const { count: bookmarks } = await admin
            .from("bookmarks")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId);

        const { count: unreadEnquiries } = await admin
            .from("messages")
            .select("id", { count: 'exact', head: true })
            .eq("is_read", false)
            .neq("sender_id", userId)
            .in("conversation_id", (
                await admin.from("conversations").select("id").eq("tenant_id", userId)
            ).data?.map(c => c.id) || []);

        return {
            views: 0,
            bookmarks: bookmarks || 0,
            unreadEnquiries: unreadEnquiries || 0
        };
    }
}

export async function sendMessage(receiverId: string, content: string, listingId?: string) {
    console.log("SEND_MESSAGE_START", { receiverId, listingId });
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = getSupabaseAdmin();

    // Ensure sender profile exists
    console.log("STEP 1: Checking profile...");
    const { data: profile } = await admin.from("profiles").select("id").eq("id", userId).single();
    if (!profile) {
        console.log("STEP 2: Syncing profile...");
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        await admin.from("profiles").upsert({
            id: userId,
            email: user.emailAddresses[0]?.emailAddress,
            full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            avatar_url: user.imageUrl,
            role: (user.publicMetadata.role as string) || "tenant",
            updated_at: new Date().toISOString()
        });
    }

    // Find or create conversation
    console.log("STEP 3: Finding/Creating conversation...");
    const { data: foundConv } = await admin
        .from("conversations")
        .select("id")
        .or(`and(tenant_id.eq.${userId},landlord_id.eq.${receiverId}),and(tenant_id.eq.${receiverId},landlord_id.eq.${userId})`)
        .single();

    let conv = foundConv;

    if (!conv) {
        console.log("STEP 4: Creating new conversation...");
        const { data: newConv, error: createError } = await admin
            .from("conversations")
            .insert({
                tenant_id: userId,
                landlord_id: receiverId,
                listing_id: listingId
            })
            .select()
            .single();
        
        if (createError) {
            console.error("Error creating conversation:", JSON.stringify(createError, null, 2));
        }
        conv = newConv;
    }

    if (!conv) {
        console.error("FAILED TO CREATE CONVERSATION. Params:", { userId, receiverId, listingId });
        throw new Error("Failed to create conversation");
    }

    console.log("STEP 5: Sending message...");
    const { error: msgError } = await admin
        .from("messages")
        .insert({
            conversation_id: conv.id,
            sender_id: userId,
            content
        });

    if (msgError) {
        console.error("Error sending message:", JSON.stringify(msgError, null, 2));
        throw msgError;
    }

    console.log("STEP 6: Updating updated_at...");
    await admin.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conv.id);

    console.log("SEND_MESSAGE_COMPLETE", conv.id);
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

    // Map data to include unreadCount and lastMessage
    const convs = data.map((c: Record<string, unknown>) => {
        const msgs = Array.isArray(c.last_message) ? c.last_message : [];
        const unreadCount = msgs.filter((m: { is_read: boolean; sender_id: string }) => !m.is_read && m.sender_id !== userId).length;
        const lastMessage = msgs.length > 0 ? [...msgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

        return {
            ...c,
            unreadCount,
            lastMessage
        };
    });

    return convs;
}

export async function markMessagesAsRead(conversationId: string) {
    console.log("MARKING AS READ", conversationId);
    const { userId } = await auth();
    if (!userId) return;

    const { error } = await getSupabaseAdmin()
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);

    if (error) {
        console.error("Error marking messages as read:", error);
    }
    
    revalidatePath("/messages");
    revalidatePath("/dashboard");
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

export async function getTenantSavedListings() {
    const { userId } = await auth();
    if (!userId) return [];

    const admin = getSupabaseAdmin();
    const { data: bookmarks } = await admin
        .from("bookmarks")
        .select("listing_id")
        .eq("user_id", userId);

    const listingIds = bookmarks?.map(b => b.listing_id) || [];
    if (listingIds.length === 0) return [];

    const { data: listings } = await admin
        .from("listings")
        .select("*")
        .in("id", listingIds);

    return listings || [];
}

/**
 * M-Pesa Actions
 */
import { initiateStkPush } from "./mpesa";

export async function initiateStkPushAction(listingId: string, phoneNumber: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const amount = 50; // Ksh 50
    const accountReference = `UNLOCK-${listingId.slice(0, 8)}`;

    try {
        const response = await initiateStkPush(phoneNumber, amount, accountReference);
        
        if (response.ResponseCode === "0") {
            const supabase = getSupabaseAdmin();
            await supabase.from("payments").insert({
                user_id: userId,
                listing_id: listingId,
                merchant_request_id: response.MerchantRequestID,
                checkout_request_id: response.CheckoutRequestID,
                amount: amount,
                phone_number: phoneNumber,
                status: "pending"
            });
            return { success: true, checkoutRequestId: response.CheckoutRequestID };
        } else {
            return { success: false, message: response.ResponseDescription };
        }
    } catch (error) {
        console.error("STK PUSH ACTION ERROR:", error);
        return { success: false, message: "Failed to initiate M-Pesa payment" };
    }
}

export async function isListingUnlocked(listingId: string) {
    const { userId } = await auth();
    if (!userId) return false;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("listing_unlocks")
        .select("id")
        .eq("user_id", userId)
        .eq("listing_id", listingId)
        .single();

    if (error || !data) return false;
    return true;
}
