"use client";

import { FormEvent, useState } from "react";
import { WAITLIST_SUCCESS_EVENT } from "@/lib/animation-timeline";
import styles from "./WaitlistShell.module.css";

type FormStatus = "idle" | "submitting" | "submitted" | "error";

export function WaitlistShell() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submitted = status === "submitted";
  const busy = status === "submitting";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || busy || submitted) return;

    const form = e.currentTarget;
    const honeypot = new FormData(form).get("website");

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website: typeof honeypot === "string" ? honeypot : "",
        }),
      });

      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Try again.";
        setStatus("error");
        setErrorMessage(message);
        return;
      }

      setStatus("submitted");
      window.dispatchEvent(new Event(WAITLIST_SUCCESS_EVENT));
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        name="website"
      />
      <div className={styles.labelWrap}>
        <label
          htmlFor="origin-email"
          className={`${styles.label} ${submitted ? styles.hidden : ""}`}
        >
          Join the waitlist
        </label>
      </div>
      <div className={styles.field}>
        <div
          className={`${styles.inputLayer} ${submitted ? styles.submitted : ""}`}
        >
          <input
            id="origin-email"
            className={styles.input}
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMessage("");
              }
            }}
            disabled={submitted || busy}
          />
          <button
            type="submit"
            aria-label="Join the waitlist"
            className={`${styles.submit} ${email.trim() ? styles.active : ""}`}
            disabled={!email.trim() || submitted || busy}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.arrow}>
              <path
                d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {status === "error" && errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div
        className={`${styles.success} ${submitted ? styles.successVisible : ""}`}
        role="status"
        aria-live="polite"
      >
        <p className={styles.successText}>
          <span aria-hidden="true" className={styles.check}>
            ✓
          </span>
          We’ll reach out when After Class is ready for you.
        </p>
      </div>
    </form>
  );
}
