"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "./supabase";

export async function setUserRole(role: "tenant" | "landlord") {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // 1. Update Clerk Metadata
    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: role
        }
    });

    // 2. Sync to Supabase Profiles
    const email = user.emailAddresses[0]?.emailAddress;
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const { error } = await getSupabaseAdmin()
        .from("profiles")
        .upsert({
            id: userId,
            email: email,
            full_name: fullName,
            avatar_url: user.imageUrl,
            role: role,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Error syncing user to Supabase:", error);
        // We don't throw here to avoid blocking the user if only Supabase fails, 
        // but Clerk succeeded. However, for a robust app, we might want to.
    }

    return { success: true };
}

export async function getUserRole() {
    const { userId } = await auth();
    if (!userId) return null;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    return (user.publicMetadata.role as "tenant" | "landlord") || null;
}
