import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment. Make sure to run with: node --env-file=.env.local test-mpesa.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function mockSafaricomPaymentCallback() {
  console.log("🔍 Looking for the most recent pending M-Pesa payment...");
  
  let { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error || !payments || payments.length === 0) {
    console.log("⚠️ No pending payments found. Creating a synthetic test payment...");
    
    // Grab any user and any listing to create a dummy payment
    const { data: user } = await supabase.from('users').select('id').limit(1).single();
    const { data: listing } = await supabase.from('listings').select('id').limit(1).single();
    
    if (!user || !listing) {
        console.log("❌ Cannot create dummy payment: No users or listings exist in the database yet.");
        return;
    }

    const { data: newPayment, error: insertError } = await supabase.from('payments').insert({
        user_id: user.id,
        listing_id: listing.id,
        merchant_request_id: "MOCK_MERCHANT_" + Date.now(),
        checkout_request_id: "ws_CO_" + Date.now(),
        amount: 50,
        phone_number: "254700000000",
        status: "pending"
    }).select().single();

    if (insertError) {
        console.log("❌ Failed to create dummy payment:", insertError.message);
        return;
    }
    payments = [newPayment];
    console.log("✅ Synthetic payment created successfully!");
  }
  
  const payment = payments[0];
  console.log(`\n✅ Using pending payment for listing ${payment.listing_id}`);
  console.log(`💳 Safaricom CheckoutRequestID: ${payment.checkout_request_id}\n`);
  console.log("🚀 Simulating successful Safaricom Server-to-Server Callback...");
  
  const payload = {
    Body: {
      stkCallback: {
        MerchantRequestID: "MOCK_MERCHANT_123",
        CheckoutRequestID: payment.checkout_request_id,
        ResultCode: 0,
        ResultDesc: "The service request is processed successfully."
      }
    }
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/mpesa/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();
    console.log("\nSafaricom Response Status:", response.status);
    console.log("Safaricom Response Body:", result);
    
    console.log("\n🎉 Success! The contact details should now be automatically unlocked on your screen!");
  } catch (err) {
    console.error("Failed to hit local callback endpoint:", err);
  }
}

mockSafaricomPaymentCallback();
