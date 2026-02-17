import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const defaultGymId = process.env.DEFAULT_GYM_ID ?? "";
const adminEmail = process.env.BOOKING_ADMIN_EMAIL ?? "";
const resendKey = process.env.RESEND_API_KEY ?? "";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { full_name, email, phone, city, company, message } = payload ?? {};

    if (!full_name || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server is missing Supabase configuration." },
        { status: 500 }
      );
    }

    const lead = {
      gym_id: defaultGymId || null,
      full_name,
      email,
      phone: phone || null,
      source: `Book Demo${city ? ` · ${city}` : ""}${company ? ` · ${company}` : ""}`,
      stage: "demo",
    };

    const leadResponse = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([lead]),
    });

    if (!leadResponse.ok) {
      const text = await leadResponse.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    if (adminEmail && resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FitSutra <no-reply@fitsutra.in>",
          to: [adminEmail],
          subject: "New FitSutra Demo Request",
          html: `<p><strong>Name:</strong> ${full_name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || "-"}</p>
<p><strong>City:</strong> ${city || "-"}</p>
<p><strong>Company:</strong> ${company || "-"}</p>
<p><strong>Message:</strong> ${message || "-"}</p>`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
