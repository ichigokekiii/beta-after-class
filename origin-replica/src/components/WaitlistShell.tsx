"use client";

import { FormEvent, useState } from "react";
import { WAITLIST_SUCCESS_EVENT } from "@/lib/animation-timeline";
import styles from "./WaitlistShell.module.css";

export function WaitlistShell() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    window.dispatchEvent(new Event(WAITLIST_SUCCESS_EVENT));
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
            placeholder="Enter your work email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitted}
          />
          <button
            type="submit"
            aria-label="Join the waitlist"
            className={`${styles.submit} ${email.trim() ? styles.active : ""}`}
            disabled={!email.trim() || submitted}
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
        <div
          className={`${styles.success} ${submitted ? styles.successVisible : ""}`}
          role="status"
          aria-live="polite"
        >
          <p className={styles.successText}>
            <span aria-hidden="true" className={styles.check}>
              ✓{" "}
            </span>
            We’ll reach out when Origin is ready for you.
          </p>
        </div>
      </div>
    </form>
  );
}
