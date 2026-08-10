type TurnstileVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns false for missing tokens or failed verification.
 */
export async function verifyTurnstileToken(
  token: unknown,
  ip: string,
): Promise<boolean> {
  if (typeof token !== "string" || !token.trim()) {
    return false;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
    remoteip: ip,
  });

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!res.ok) {
      console.error("turnstile siteverify HTTP error", res.status);
      return false;
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch (error) {
    console.error("turnstile siteverify failed", error);
    return false;
  }
}
