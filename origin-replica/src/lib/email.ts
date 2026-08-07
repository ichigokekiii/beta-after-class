export type Email = string & { readonly __brand: "Email" };

const MAX_EMAIL_LEN = 254;
const MAX_LOCAL_LEN = 64;

// ASCII allowlist. Labels are alnum, separators are limited, TLD is letters only.
const EMAIL_RE =
  /^[a-z0-9]+(?:[._+-][a-z0-9]+)*@[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.[a-z]{2,}$/;

export function parseEmail(value: unknown): Email | null {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN) return null;
  if (/[\u0000-\u001f\u007f<>"'`;(){}[\]\\/\s]/.test(email)) return null;
  if (email.includes("..")) return null;

  const at = email.lastIndexOf("@");
  if (at <= 0 || at !== email.indexOf("@")) return null;

  const local = email.slice(0, at);
  if (local.length === 0 || local.length > MAX_LOCAL_LEN) return null;

  if (!EMAIL_RE.test(email)) return null;
  return email as Email;
}
