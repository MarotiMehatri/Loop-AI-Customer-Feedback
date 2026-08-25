"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, BarChart3, Building2, Check, LockKeyhole, Mail, Sparkles, User } from "lucide-react";

import { register } from "../../../Features/Auth/api/auth.api";
import { getErrorMessage } from "../../../lib/api/api-error";
import { useAuthStore } from "../../../store";
import styles from "./signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register({ name, email, password, workspaceName });
      toast.success("Account created successfully. Please sign in to continue.");
      router.push("/auth/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return <main className={styles.page}>
    <aside className={styles.story}>
      <div className={styles.brand}><i>∞</i> LOOP</div>
      <p className={styles.tag}>AI Customer Feedback<br />Intelligence Platform</p>
      <div className={styles.copy}>
        <span className={styles.eyebrow}><Sparkles size={15} /> Turn feedback into progress</span>
        <h1>Build better products with <em>every insight.</em></h1>
        <p>Bring all customer feedback into one intelligent workspace and uncover the next best action.</p>
      </div>
      <div className={styles.benefits}>
        <div><span><BarChart3 size={20} /></span><p><b>AI-powered insights</b><small>Understand what customers need most.</small></p></div>
        <div><span><Check size={20} /></span><p><b>Ready in minutes</b><small>Create your team workspace in one step.</small></p></div>
      </div>
    </aside>
    <section className={styles.formWrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formTop}><div className={styles.formIcon}><Building2 size={24} /></div><span>GET STARTED</span></div>
        <h2>Create your workspace</h2>
        <p className={styles.subtitle}>Start capturing and analysing customer feedback with AI.</p>
        <label><span>Full name</span><div className={styles.inputWrap}><User size={17} /><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Thompson" autoComplete="name" required /></div></label>
        <label><span>Work email</span><div className={styles.inputWrap}><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></div></label>
        <label><span>Workspace name</span><div className={styles.inputWrap}><Building2 size={17} /><input type="text" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Acme Corp" required /></div></label>
        <label><span>Password</span><div className={styles.inputWrap}><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" autoComplete="new-password" minLength={8} required /></div></label>
        <p className={styles.passwordNote}>Use at least 8 characters for a secure password.</p>
        <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Creating workspace…" : <>Create workspace <ArrowRight size={17} /></>}</button>
        <p className={styles.hint}>Already have an account? <Link href="/auth/login">Sign in</Link></p>
      </form>
    </section>
  </main>;
}
