import { NextResponse } from "next/server";
import { parseEmail } from "@/lib/email";
import { notifyWaitlistSignup } from "@/lib/notify-waitlist";
import { getSupabase } from "@/lib/supabase";
import {
  allowWaitlistAttempt,
  clientIp,
  isBodyTooLarge,
  parseWaitlistBody,
} from "@/lib/waitlist-request";

export async function POST(request: Request) {
  if (isBodyTooLarge(request)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const ip = clientIp(request);
  if (!allowWaitlistAttempt(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body = parseWaitlistBody(raw);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot — treat bots as success without writing
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = parseEmail(body.email);
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
