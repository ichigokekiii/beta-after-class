import { NextResponse } from "next/server";
import { notifyWaitlistSignup } from "@/lib/notify-waitlist";
import { getSupabase } from "@/lib/supabase";

type WaitlistBody = {
  email?: unknown;
  website?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export async function POST(request: Request) {
  let body: WaitlistBody;
  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot — treat bots as success without writing
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // Already signed up — treat as success so the UI stays clean
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }

    console.error("waitlist insert failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json({ error: "Could not join waitlist" }, { status: 500 });
  }

  // Notify inbox after a new row is stored; never fail the signup on email errors
  try {
    await notifyWaitlistSignup(email);
  } catch (notifyError) {
    console.error("waitlist notify failed", notifyError);
  }

  return NextResponse.json({ ok: true });
}
