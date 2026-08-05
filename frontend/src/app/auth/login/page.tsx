"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "../../../lib/api/api-error";
import { useAuthStore } from "../../../store";

import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const isViewerLogin = searchParams.get("role") === "viewer";

  const [email, setEmail] = useState(isViewerLogin ? "viewer@loop.com" : "admin@loop.com");
  const [password, setPassword] = useState("Loop@123");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back to LOOP");
      router.push(user.role === "VIEWER" ? "/protected/viewer" : "/protected/admin/dashboard");
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
          <h1>Sign in to your workspace</h1>
          <p className={styles.subtitle}>
            Monitor, analyse and act on customer feedback with AI.
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

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className={styles.hint}>
            Demo access: <b>{isViewerLogin ? "viewer@loop.com" : "admin@loop.com"}</b> / <b>Loop@123</b>
          </p>
        </form>
      </section>
    </main>
  );
}
