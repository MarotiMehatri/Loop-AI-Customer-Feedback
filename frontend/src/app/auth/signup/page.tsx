"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { register } from "../../../Features/Auth/api/auth.api";
import { getErrorMessage } from "../../../lib/api/api-error";
import { useAuthStore } from "../../../store";

import styles from "../login/login.module.css";

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await register({ name, email, password, workspaceName });
      await login(email, password);
      toast.success(`Workspace created. Welcome, ${result.user.name}!`);
      router.push("/protected/admin/dashboard");
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
          <h1>Create your workspace</h1>
          <p className={styles.subtitle}>
            Start capturing and analysing customer feedback with AI.
          </p>

          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Thompson"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Work email
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
            Workspace name
            <input
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Acme Corp"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? "Creating workspace…" : "Create workspace"}
          </button>

          <p className={styles.hint}>
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
