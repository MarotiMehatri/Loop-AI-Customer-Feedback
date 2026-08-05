"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { apiClient } from "../../../lib/api/api-client";
import { getErrorMessage } from "../../../lib/api/api-error";

import styles from "../login/login.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/auth/password-reset/confirm", { token, password });
      toast.success("Password updated. Please sign in.");
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
          <h1>Choose a new password</h1>
          <p className={styles.subtitle}>
            {token ? "Set your new password below." : "A reset token is required."}
          </p>

          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              autoComplete="new-password"
              minLength={8}
              disabled={!token}
              required
            />
          </label>

          <button className={styles.submit} type="submit" disabled={submitting || !token}>
            {submitting ? "Updating password…" : "Update password"}
          </button>

          <p className={styles.hint}>
            Remembered it? <Link href="/auth/login">Back to sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
