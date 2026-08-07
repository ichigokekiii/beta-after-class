import { Resend } from "resend";

const NOTIFY_TO = process.env.WAITLIST_NOTIFY_TO ?? "info@afterclassapp.com";
const FROM =
  process.env.WAITLIST_NOTIFY_FROM ?? "After Class Waitlist <onboarding@resend.dev>";

export async function notifyWaitlistSignup(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; skipping waitlist email notify");
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM,
    to: [NOTIFY_TO],
    subject: `New waitlist signup: ${email}`,
    text: [
      "Someone joined the After Class waitlist.",
      "",
      `Email: ${email}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}
