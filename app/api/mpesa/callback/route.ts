import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Structure of Safaricom STK Push Callback Payload
        const { Body: { stkCallback } } = body;
        
        const merchantRequestId = stkCallback.MerchantRequestID;
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;

        console.log("M-Pesa Callback Received:", merchantRequestId, checkoutRequestId, resultCode, resultDesc);

        const supabase = getSupabaseAdmin();
        const status = resultCode === 0 ? "completed" : "failed";

        // Update payment status
        const { data: payment, error } = await supabase
            .from("payments")
            .update({
                status,
                result_code: String(resultCode),
                result_description: resultDesc
            })
            .eq("checkout_request_id", checkoutRequestId)
            .select()
            .single();

        if (error) {
            console.error("Error updating payment status:", error);
            return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
        }

        // If completed, automatically create an unlock record
        if (status === "completed" && payment) {
            await supabase.from("listing_unlocks").insert({
                user_id: payment.user_id,
                listing_id: payment.listing_id
            });
            console.log("Listing unlocked successfully for user", payment.user_id);
        }

        // Return a 200 to acknowledge Safaricom Webhook
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
        
    } catch (error) {
        console.error("M-Pesa Callback Processing Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
