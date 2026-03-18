export async function getMpesaAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error("Missing M-Pesa credentials");
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
            Authorization: `Basic ${auth}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to get M-Pesa access token");
    }

    const data = await response.json();
    return data.access_token;
}

export async function initiateStkPush(phoneNumber: string, amount: number, accountReference: string) {
    const token = await getMpesaAccessToken();
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!passkey || !shortcode || !callbackUrl) {
        throw new Error("Missing M-Pesa config variables");
    }

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // Format phone number to 254...
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
        formattedPhone = `254${formattedPhone.slice(1)}`;
    } else if (formattedPhone.startsWith("7") || formattedPhone.startsWith("1")) {
        formattedPhone = `254${formattedPhone}`;
    }

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: "Payment for Listing Contact Details",
    };

    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
}
