// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { toast } from "sonner";
// import { Eye, EyeOff, LockKeyhole, Mail, Send } from "lucide-react";
// import { apiClient } from "../../../lib/api/api-client";
// import { getErrorMessage } from "../../../lib/api/api-error";
// import { useAuthStore } from "../../../store";
// import styles from "./login.module.css";

// type Role = "ADMIN" | "ANALYST" | "VIEWER";

// const roles: readonly [Role, string, string, string, string][] = [
//   ["ADMIN", "♔", "Admin", "Full Access", "Manage users, settings and all platform features."],
//   ["ANALYST", "▥", "Analyst", "Insights Access", "Access insights, reports, and advanced analytics."],
//   ["VIEWER", "◉", "Viewer", "Read Only", "View feedback and insights."],
// ];
// const demoEmails: Record<Role, string> = { ADMIN: "admin@loop.com", ANALYST: "analyst@loop.com", VIEWER: "viewer@loop.com" };

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const login = useAuthStore((state) => state.login);
//   const logout = useAuthStore((state) => state.logout);
//   const [role, setRole] = useState<Role>(searchParams.get("role") === "viewer" ? "VIEWER" : "ANALYST");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [show, setShow] = useState(false);
//   const [remember, setRemember] = useState(true);
//   const [code, setCode] = useState(["", "", "", "", "", ""]);
//   const [requested, setRequested] = useState(false);
//   const [verified, setVerified] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const selectRole = (nextRole: Role) => {
//     setRole(nextRole);
//     if (Object.values(demoEmails).includes(email)) setEmail(demoEmails[nextRole]);
//   };
//   const requestVerification = async () => {
//     if (!email) return toast.error("Enter your email first");
//     setSubmitting(true);
//     try {
//       const { data } = await apiClient.post<{ message: string; otp?: string; previewUrl?: string }>("/auth/email-verification/request", { email });
//       setCode(["", "", "", "", "", ""]);
//       setRequested(true);
//       setVerified(false);
//       if (data.otp) {
//         toast.success(`${data.message} • Dev OTP: ${data.otp}`);
//       } else {
//         toast.success(data.message);
//       }
//     } catch (error) {
//       toast.error(getErrorMessage(error));
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   const verifyCode = async () => {
//     const otp = code.join("");
//     if (otp.length !== 6) return toast.error("Enter the 6-digit code");
//     setSubmitting(true);
//     try { await apiClient.post("/auth/email-verification/confirm", { email, otp }); setVerified(true); toast.success("Email verified successfully"); }
//     catch (error) { toast.error(getErrorMessage(error)); } finally { setSubmitting(false); }
//   };
//   const handleLogin = async (event: React.FormEvent) => {
//     event.preventDefault(); setSubmitting(true);
//     try {
//       const user = await login(email, password);
//       if (user.role !== role) { logout(); toast.error(`This account is ${user.role.toLowerCase()}. Select that role or use the correct ${role.toLowerCase()} account.`); return; }
//       if (!remember) sessionStorage.removeItem("loop-auth");
//       toast.success("Welcome back to LOOP");
//       // Route users by role: viewers -> viewer area, analysts -> analytics, admins -> admin dashboard
//       if (user.role === "VIEWER") router.push("/protected/viewer");
//       else if (user.role === "ANALYST") router.push("/protected/admin/analytics");
//       else router.push("/protected/admin/dashboard");
//     } catch (error) { toast.error(getErrorMessage(error)); } finally { setSubmitting(false); }
//   };

//   return <main className={styles.page}><aside className={styles.story}><div className={styles.brand}><i>∞</i>LOOP</div><p className={styles.tag}>AI Customer Feedback<br />Intelligence Platform</p><h1>Understand Feedback.<br />Drive <em>Better Experiences.</em></h1><p>LOOP helps you view and stay informed with real-time feedback insights, reports, and updates that matter to you.</p><div className={styles.points}>{[["◉", "View Real-time Insights", "Access up-to-date feedback summaries and key metrics."], ["▤", "Stay Informed", "Keep track of important updates, trends, and notifications."], ["♢", "Secure & Reliable", "Your data is protected with enterprise-grade security."], ["♧", "Personalized Experience", "A focused experience tailored for viewing and staying informed."]].map(([icon, title, text]) => <div className={styles.point} key={title}><i>{icon}</i><div><b>{title}</b><span>{text}</span></div></div>)}</div></aside><section className={styles.formWrap}><button className={styles.theme} aria-label="Toggle theme">◐</button><form className={styles.form} onSubmit={handleLogin}><div className={styles.badge}>♙</div><h2>Welcome back! 👋</h2><p className={styles.subtitle}>Sign in to your LOOP account</p><label>Select your role</label><div className={styles.roles}>{roles.map(([key, icon, title, access, text]) => <button type="button" key={key} onClick={() => selectRole(key)} className={`${styles.role} ${role === key ? styles.active : ""}`}><i>{icon}</i><b>{title} <small>{access}</small></b><small>{text}</small></button>)}</div><label>Work email<div className={styles.password}><Mail size={18} /><input className={styles.input} style={{ paddingLeft: 43 }} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required /></div></label><button type="button" className={styles.send} onClick={requestVerification} disabled={submitting}><Send size={17} /> {submitting ? "Sending…" : "Send verification code"}</button><div className={styles.verify}><div className={styles.verifyHead}><div><b>Email verification</b><small>{verified ? "Your email is verified" : "Enter the 6-digit code sent to your email"}</small></div><button type="button" className={styles.resend} onClick={requestVerification} disabled={submitting}><span>{requested ? "↻ Resend code" : "Request code"}</span></button></div><div className={styles.codes}>{code.map((value, index) => <input key={index} inputMode="numeric" maxLength={1} value={value} onChange={(event) => setCode((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value.slice(-1) : item))} aria-label={`Verification digit ${index + 1}`} disabled={verified} />)}</div><button type="button" className={styles.verifyBtn} onClick={verifyCode} disabled={submitting || verified}>{verified ? "✓ Verified" : submitting ? "Verifying…" : "Verify code"}</button></div><label>Password<div className={styles.password}><LockKeyhole size={18} /><input className={styles.input} style={{ paddingLeft: 43 }} type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" required /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><div className={styles.options}><label className={styles.remember}><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Remember me</label><Link href="/auth/forget-password">Forgot password?</Link></div><button className={styles.submit} type="submit" disabled={submitting}><LockKeyhole size={17} /> {submitting ? "Logging in…" : "Login"}</button><p className={styles.bottom}>Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link></p></form></section></main>;
// }
"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { loginUser } from "../../../lib/api/auth";
import { saveAuthSession } from "../../../lib/auth/auth-storage";
import type { AuthRole, LoginResponse, LoginRole } from "../../../types/auth.types";

const roles: Array<{
  id: LoginRole;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: "ADMIN",
    title: "Admin",
    description: "Manage workspace, users, feedback and settings.",
    icon: "A",
  },
  {
    id: "ANALYST",
    title: "Analyst",
    description: "Analyze feedback, trends, themes and reports.",
    icon: "AN",
  },
  {
    id: "VIEWER",
    title: "Viewer",
    description: "View dashboards, insights and published reports.",
    icon: "V",
  },
];

function getRoleRoute(role: AuthRole): string {
  switch (role) {
    case "ADMIN":
      return "/protected/admin";
    case "ANALYST":
      return "/protected/analyst";
    case "VIEWER":
      return "/protected/viewer";
    default:
      return "/protected/unauthorized";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign in. Please check your details and try again.";
}

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<LoginRole>("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoleInfo = useMemo(
    () => roles.find((role) => role.id === selectedRole) ?? roles[0],
    [selectedRole],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your work email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response: LoginResponse = await loginUser({
        email: normalizedEmail,
        password,
      });

      const userRole = response.user.role;

      if (userRole !== selectedRole) {
        throw new Error(
          `This account is registered as ${userRole.toLowerCase()}. Please select ${userRole.toLowerCase()} before signing in.`,
        );
      }

      saveAuthSession(response, rememberMe);
      router.replace(getRoleRoute(userRole));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.visualPanel} aria-label="LOOP product introduction">
        <div className={styles.visualGlowOne} />
        <div className={styles.visualGlowTwo} />

        <header className={styles.brand}>
          <div className={styles.brandMark}>L</div>
          <span>LOOP</span>
        </header>

        <div className={styles.visualContent}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            AI CUSTOMER FEEDBACK PLATFORM
          </div>

          <h1>
            Turn customer
            <span> feedback into </span>
            action.
          </h1>

          <p>
            Understand what customers are saying, discover the themes that
            matter and make faster decisions with AI-powered insights.
          </p>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.previewLabel}>CUSTOMER SENTIMENT</span>
                <strong>Weekly overview</strong>
              </div>
              <span className={styles.liveBadge}>LIVE</span>
            </div>

            <div className={styles.chart}>
              <span className={styles.chartLine} />
              <span className={styles.chartLine} />
              <span className={styles.chartLine} />
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M0 122 C35 118 45 90 76 96 C108 102 120 76 153 82 C190 89 201 54 237 62 C270 69 283 38 320 48 C352 58 370 24 405 36 C436 47 453 18 500 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className={styles.previewStats}>
              <div>
                <strong>72.4%</strong>
                <span>Positive</span>
              </div>
              <div>
                <strong>+8.6%</strong>
                <span>vs last week</span>
              </div>
              <div>
                <strong>1,248</strong>
                <span>Responses</span>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.visualFooter}>
          <span>AI-powered feedback intelligence</span>
          <span>Secure workspace access</span>
        </footer>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.mobileBrand}>
          <div className={styles.brandMark}>L</div>
          <span>LOOP</span>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <span className={styles.formEyebrow}>WELCOME BACK</span>
            <h2>Sign in to LOOP</h2>
            <p>Access your customer feedback workspace.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <fieldset className={styles.roleFieldset}>
              <legend>Continue as</legend>

              <div className={styles.roleGrid}>
                {roles.map((role) => {
                  const active = selectedRole === role.id;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      className={`${styles.roleCard} ${active ? styles.roleCardActive : ""}`}
                      onClick={() => {
                        setSelectedRole(role.id);
                        setError("");
                      }}
                      aria-pressed={active}
                    >
                      <span className={styles.roleIcon}>{role.icon}</span>
                      <span className={styles.roleText}>
                        <strong>{role.title}</strong>
                        <small>{role.description}</small>
                      </span>
                      <span className={styles.radio}>
                        {active && <span />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className={styles.selectedRole}>
              <span className={styles.selectedRoleIcon}>{selectedRoleInfo.icon}</span>
              <div>
                <span>Selected workspace role</span>
                <strong>{selectedRoleInfo.title}</strong>
              </div>
            </div>

            <label className={styles.inputGroup}>
              <span>Work email</span>
              <div className={styles.inputWrap}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  disabled={loading}
                />
              </div>
            </label>

            <label className={styles.inputGroup}>
              <span className={styles.passwordLabel}>
                <span>Password</span>
                <button
                  type="button"
                  className={styles.forgotButton}
                  onClick={() => router.push("/auth/forgot-password")}
                >
                  Forgot password?
                </button>
              </span>

              <div className={styles.inputWrap}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={loading}
              />
              <span className={styles.customCheckbox} />
              <span>Keep me signed in</span>
            </label>

            {error ? (
              <div className={styles.error} role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            ) : null}

            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {selectedRoleInfo.title}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            <small>SECURE ACCESS</small>
            <span />
          </div>

          <p className={styles.signupText}>
            New to LOOP?{" "}
            <button type="button" onClick={() => router.push("/auth/signup")}>
              Create an account
            </button>
          </p>

          <p className={styles.legal}>
            By continuing, you agree to LOOP&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
