"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function setUserRole(role: "tenant" | "landlord") {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    
    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: role
        }
    });

    return { success: true };
}

export async function getUserRole() {
    const { userId } = await auth();
    if (!userId) return null;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    return (user.publicMetadata.role as "tenant" | "landlord") || null;
}
