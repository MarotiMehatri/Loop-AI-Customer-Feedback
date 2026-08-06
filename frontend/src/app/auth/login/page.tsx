"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LockKeyhole, Mail, Send } from "lucide-react";
import { apiClient } from "../../../lib/api/api-client";
import { getErrorMessage } from "../../../lib/api/api-error";
import { useAuthStore } from "../../../store";
import styles from "./login.module.css";

type Role = "ADMIN" | "ANALYST" | "VIEWER";

const roles: readonly [Role, string, string, string, string][] = [
  ["ADMIN", "♔", "Admin", "Full Access", "Manage users, settings and all platform features."],
  ["ANALYST", "▥", "Analyst", "Insights Access", "Access insights, reports, and advanced analytics."],
  ["VIEWER", "◉", "Viewer", "Read Only", "View feedback and insights."],
];
const demoEmails: Record<Role, string> = { ADMIN: "admin@loop.com", ANALYST: "analyst@loop.com", VIEWER: "viewer@loop.com" };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [role, setRole] = useState<Role>(searchParams.get("role") === "viewer" ? "VIEWER" : "ANALYST");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [requested, setRequested] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectRole = (nextRole: Role) => {
    setRole(nextRole);
    if (Object.values(demoEmails).includes(email)) setEmail(demoEmails[nextRole]);
  };
  const requestVerification = async () => {
    if (!email) return toast.error("Enter your email first");
    setSubmitting(true);
    try { const { data } = await apiClient.post<{ message: string }>("/auth/email-verification/request", { email }); setCode(["", "", "", "", "", ""]); setRequested(true); setVerified(false); toast.success(data.message); }
    catch (error) { toast.error(getErrorMessage(error)); } finally { setSubmitting(false); }
  };
  const verifyCode = async () => {
    const otp = code.join("");
    if (otp.length !== 6) return toast.error("Enter the 6-digit code");
    setSubmitting(true);
    try { await apiClient.post("/auth/email-verification/confirm", { email, otp }); setVerified(true); toast.success("Email verified successfully"); }
    catch (error) { toast.error(getErrorMessage(error)); } finally { setSubmitting(false); }
  };
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role !== role) { logout(); toast.error(`This account is ${user.role.toLowerCase()}. Select that role or use the correct ${role.toLowerCase()} account.`); return; }
      if (!remember) sessionStorage.removeItem("loop-auth");
      toast.success("Welcome back to LOOP");
      // Route users by role: viewers -> viewer area, analysts -> analytics, admins -> admin dashboard
      if (user.role === "VIEWER") router.push("/protected/viewer");
      else if (user.role === "ANALYST") router.push("/protected/admin/analytics");
      else router.push("/protected/admin/dashboard");
    } catch (error) { toast.error(getErrorMessage(error)); } finally { setSubmitting(false); }
  };

  return <main className={styles.page}><aside className={styles.story}><div className={styles.brand}><i>∞</i>LOOP</div><p className={styles.tag}>AI Customer Feedback<br />Intelligence Platform</p><h1>Understand Feedback.<br />Drive <em>Better Experiences.</em></h1><p>LOOP helps you view and stay informed with real-time feedback insights, reports, and updates that matter to you.</p><div className={styles.points}>{[["◉", "View Real-time Insights", "Access up-to-date feedback summaries and key metrics."], ["▤", "Stay Informed", "Keep track of important updates, trends, and notifications."], ["♢", "Secure & Reliable", "Your data is protected with enterprise-grade security."], ["♧", "Personalized Experience", "A focused experience tailored for viewing and staying informed."]].map(([icon, title, text]) => <div className={styles.point} key={title}><i>{icon}</i><div><b>{title}</b><span>{text}</span></div></div>)}</div></aside><section className={styles.formWrap}><button className={styles.theme} aria-label="Toggle theme">◐</button><form className={styles.form} onSubmit={handleLogin}><div className={styles.badge}>♙</div><h2>Welcome back! 👋</h2><p className={styles.subtitle}>Sign in to your LOOP account</p><label>Select your role</label><div className={styles.roles}>{roles.map(([key, icon, title, access, text]) => <button type="button" key={key} onClick={() => selectRole(key)} className={`${styles.role} ${role === key ? styles.active : ""}`}><i>{icon}</i><b>{title} <small>{access}</small></b><small>{text}</small></button>)}</div><label>Work email<div className={styles.password}><Mail size={18} /><input className={styles.input} style={{ paddingLeft: 43 }} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required /></div></label><button type="button" className={styles.send} onClick={requestVerification} disabled={submitting}><Send size={17} /> {submitting ? "Sending…" : "Send verification code"}</button><div className={styles.verify}><div className={styles.verifyHead}><div><b>Email verification</b><small>{verified ? "Your email is verified" : "Enter the 6-digit code sent to your email"}</small></div><button type="button" className={styles.resend} onClick={requestVerification} disabled={submitting}><span>{requested ? "↻ Resend code" : "Request code"}</span></button></div><div className={styles.codes}>{code.map((value, index) => <input key={index} inputMode="numeric" maxLength={1} value={value} onChange={(event) => setCode((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value.slice(-1) : item))} aria-label={`Verification digit ${index + 1}`} disabled={verified} />)}</div><button type="button" className={styles.verifyBtn} onClick={verifyCode} disabled={submitting || verified}>{verified ? "✓ Verified" : submitting ? "Verifying…" : "Verify code"}</button></div><label>Password<div className={styles.password}><LockKeyhole size={18} /><input className={styles.input} style={{ paddingLeft: 43 }} type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" required /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><div className={styles.options}><label className={styles.remember}><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Remember me</label><Link href="/auth/forget-password">Forgot password?</Link></div><button className={styles.submit} type="submit" disabled={submitting}><LockKeyhole size={17} /> {submitting ? "Logging in…" : "Login"}</button><p className={styles.bottom}>Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link></p></form></section></main>;
}
