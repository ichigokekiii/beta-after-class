/**
 * Lightweight security unit checks for waitlist helpers.
 * Run: npx tsx scripts/test-waitlist-security.ts
 */
import assert from "node:assert/strict";
import { parseEmail } from "../src/lib/email";
import { parseWaitlistBody, isBodyTooLarge } from "../src/lib/waitlist-request";

function requestWithLength(n: number | null): Request {
  const headers = new Headers();
  if (n !== null) headers.set("content-length", String(n));
  return new Request("http://localhost/api/waitlist", { method: "POST", headers });
}

// Email parsing
assert.equal(parseEmail("user@school.edu.ph"), "user@school.edu.ph");
assert.equal(parseEmail("  User@School.EDU.PH  "), "user@school.edu.ph");
assert.equal(parseEmail("not-an-email"), null);
assert.equal(parseEmail("a@b.c"), null); // TLD too short for our rule? wait — .c is 1 letter
assert.equal(parseEmail("user@evil.com<script>"), null);
assert.equal(parseEmail("user@evil.com\nBcc:x@y.com"), null);
assert.equal(parseEmail({ email: "x@y.com" }), null);

// Body parsing
assert.equal(parseWaitlistBody(null), null);
assert.equal(parseWaitlistBody([]), null);
assert.deepEqual(parseWaitlistBody({ email: "a@b.co", website: "", turnstileToken: "tok" }), {
  email: "a@b.co",
  website: "",
  turnstileToken: "tok",
});

// Body size
assert.equal(isBodyTooLarge(requestWithLength(100)), false);
assert.equal(isBodyTooLarge(requestWithLength(9000)), true);
assert.equal(isBodyTooLarge(requestWithLength(null)), false);

console.log("waitlist security unit checks passed");
