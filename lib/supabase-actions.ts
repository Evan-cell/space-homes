"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase, getSupabaseAdmin } from "./supabase";
import { revalidatePath } from "next/cache";

export async function createListing(formData: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

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
            space_size: formData.spaceSize ? parseInt(formData.spaceSize) : null,
            phone_number: formData.phoneNumber || null,
            rating: 0,
        });

    if (error) {
        console.error("Error creating listing:", error);
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
        console.error("Error fetching landlord listings:", error);
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
