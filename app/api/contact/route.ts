import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { error } = await resend.emails.send({
            from: "SpaceKC Contact <onboarding@resend.dev>",
            to: "malcomchege0582@gmail.com",
            replyTo: email,
            subject: `New SpaceKC Message from ${name}`,
            html: `
                <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 900; color: #111827;">New Contact Message</h2>
                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">SpaceKC received a new message via the Contact page.</p>

                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">From</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">${name}</p>
                    </div>

                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">Reply To</p>
                        <a href="mailto:${email}" style="margin: 0; font-size: 16px; font-weight: 700; color: #6366f1; text-decoration: none;">${email}</a>
                    </div>

                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                        <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">Message</p>
                        <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                    </div>

                    <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                        Sent via SpaceKC Contact Form · <a href="https://www.spacekc.com" style="color: #6366f1;">spacekc.com</a>
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Contact route error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
