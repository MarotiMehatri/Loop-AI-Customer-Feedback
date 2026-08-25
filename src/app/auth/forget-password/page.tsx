"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient } from "../../../lib/api/api-client";
import { getErrorMessage } from "../../../lib/api/api-error";

import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/auth/password-reset/request", { email });
      toast.success("If that email exists, a reset link has been sent.");
      router.push("/auth/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <i>∞</i> LOOP
          </span>
          <p className={styles.tagline}>
            AI Customer Feedback<br />Intelligence Platform
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h1>Reset your password</h1>
          <p className={styles.subtitle}>
            Enter your email and we will send you a reset link.
          </p>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </label>

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? "Sending link…" : "Send reset link"}
          </button>

          <p className={styles.hint}>
            Remembered it? <Link href="/auth/login">Back to sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
