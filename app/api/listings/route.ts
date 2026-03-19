import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
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
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        
        const { error } = await getSupabaseAdmin()
            .from("listings")
            .insert({
                landlord_id: userId,
                title: body.title,
                price: body.price,
                price_value: parseFloat(body.priceValue),
                location: body.location,
                type: body.type,
                description: body.description,
                amenities: body.amenities || [],
                images: body.images || [],
                rating: 0,
                map_url: body.mapUrl || null,
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
