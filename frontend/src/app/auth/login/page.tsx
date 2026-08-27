
// "use client";

// import { FormEvent, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import styles from "./login.module.css";
// import { loginUser } from "../../../lib/api/auth";
// import { saveAuthSession } from "../../../lib/auth/auth-storage";
// import type { AuthRole, LoginResponse, LoginRole } from "../../../types/auth.types";

// const roles: Array<{
//   id: LoginRole;
//   title: string;
//   description: string;
//   icon: string;
// }> = [
//   {
//     id: "ADMIN",
//     title: "Admin",
//     description: "Manage workspace, users, feedback and settings.",
//     icon: "A",
//   },
//   {
//     id: "ANALYST",
//     title: "Analyst",
//     description: "Analyze feedback, trends, themes and reports.",
//     icon: "AN",
//   },
//   {
//     id: "VIEWER",
//     title: "Viewer",
//     description: "View dashboards, insights and published reports.",
//     icon: "V",
//   },
// ];

// function getRoleRoute(role: AuthRole): string {
//   switch (role) {
//     case "ADMIN":
//       return "/protected/admin";
//     case "ANALYST":
//       return "/protected/analyst";
//     case "VIEWER":
//       return "/protected/viewer";
//     default:
//       return "/protected/unauthorized";
//   }
// }

// function getErrorMessage(error: unknown): string {
//   if (error instanceof Error && error.message) {
//     return error.message;
//   }

//   return "Unable to sign in. Please check your details and try again.";
// }

// export default function LoginPage() {
//   const router = useRouter();

//   const [selectedRole, setSelectedRole] = useState<LoginRole>("ADMIN");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const selectedRoleInfo = useMemo(
//     () => roles.find((role) => role.id === selectedRole) ?? roles[0],
//     [selectedRole],
//   );

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const normalizedEmail = email.trim();

//     if (!normalizedEmail) {
//       setError("Please enter your work email.");
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     if (!password) {
//       setError("Please enter your password.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const response: LoginResponse = await loginUser({
//         email: normalizedEmail,
//         password,
//       });

//       const userRole = response.user.role;

//       if (userRole !== selectedRole) {
//         throw new Error(
//           `This account is registered as ${userRole.toLowerCase()}. Please select ${userRole.toLowerCase()} before signing in.`,
//         );
//       }

//       saveAuthSession(response, rememberMe);
//       router.replace(getRoleRoute(userRole));
//     } catch (requestError) {
//       setError(getErrorMessage(requestError));
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className={styles.page}>
//       <section className={styles.visualPanel} aria-label="LOOP product introduction">
//         <div className={styles.visualGlowOne} />
//         <div className={styles.visualGlowTwo} />

//         <header className={styles.brand}>
//           <div className={styles.brandMark}>L</div>
//           <span>LOOP</span>
//         </header>

//         <div className={styles.visualContent}>
//           <div className={styles.eyebrow}>
//             <span className={styles.eyebrowDot} />
//             AI CUSTOMER FEEDBACK PLATFORM
//           </div>

//           <h1>
//             Turn customer
//             <span> feedback into </span>
//             action.
//           </h1>

//           <p>
//             Understand what customers are saying, discover the themes that
//             matter and make faster decisions with AI-powered insights.
//           </p>

//           <div className={styles.previewCard}>
//             <div className={styles.previewHeader}>
//               <div>
//                 <span className={styles.previewLabel}>CUSTOMER SENTIMENT</span>
//                 <strong>Weekly overview</strong>
//               </div>
//               <span className={styles.liveBadge}>LIVE</span>
//             </div>

//             <div className={styles.chart}>
//               <span className={styles.chartLine} />
//               <span className={styles.chartLine} />
//               <span className={styles.chartLine} />
//               <svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
//                 <path
//                   d="M0 122 C35 118 45 90 76 96 C108 102 120 76 153 82 C190 89 201 54 237 62 C270 69 283 38 320 48 C352 58 370 24 405 36 C436 47 453 18 500 22"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                   strokeLinecap="round"
//                 />
//               </svg>
//             </div>

//             <div className={styles.previewStats}>
//               <div>
//                 <strong>72.4%</strong>
//                 <span>Positive</span>
//               </div>
//               <div>
//                 <strong>+8.6%</strong>
//                 <span>vs last week</span>
//               </div>
//               <div>
//                 <strong>1,248</strong>
//                 <span>Responses</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <footer className={styles.visualFooter}>
//           <span>AI-powered feedback intelligence</span>
//           <span>Secure workspace access</span>
//         </footer>
//       </section>

//       <section className={styles.formPanel}>
//         <div className={styles.mobileBrand}>
//           <div className={styles.brandMark}>L</div>
//           <span>LOOP</span>
//         </div>

//         <div className={styles.formContainer}>
//           <div className={styles.formHeader}>
//             <span className={styles.formEyebrow}>WELCOME BACK</span>
//             <h2>Sign in to LOOP</h2>
//             <p>Access your customer feedback workspace.</p>
//           </div>

//           <form className={styles.form} onSubmit={handleSubmit} noValidate>
//             <fieldset className={styles.roleFieldset}>
//               <legend>Continue as</legend>

//               <div className={styles.roleGrid}>
//                 {roles.map((role) => {
//                   const active = selectedRole === role.id;

//                   return (
//                     <button
//                       key={role.id}
//                       type="button"
//                       className={`${styles.roleCard} ${active ? styles.roleCardActive : ""}`}
//                       onClick={() => {
//                         setSelectedRole(role.id);
//                         setError("");
//                       }}
//                       aria-pressed={active}
//                     >
//                       <span className={styles.roleIcon}>{role.icon}</span>
//                       <span className={styles.roleText}>
//                         <strong>{role.title}</strong>
//                         <small>{role.description}</small>
//                       </span>
//                       <span className={styles.radio}>
//                         {active && <span />}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </fieldset>

//             <div className={styles.selectedRole}>
//               <span className={styles.selectedRoleIcon}>{selectedRoleInfo.icon}</span>
//               <div>
//                 <span>Selected workspace role</span>
//                 <strong>{selectedRoleInfo.title}</strong>
//               </div>
//             </div>

//             <label className={styles.inputGroup}>
//               <span>Work email</span>
//               <div className={styles.inputWrap}>
//                 <svg viewBox="0 0 24 24" aria-hidden="true">
//                   <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
//                   <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" />
//                 </svg>
//                 <input
//                   type="email"
//                   name="email"
//                   autoComplete="email"
//                   placeholder="you@company.com"
//                   value={email}
//                   onChange={(event) => {
//                     setEmail(event.target.value);
//                     setError("");
//                   }}
//                   disabled={loading}
//                 />
//               </div>
//             </label>

//             <label className={styles.inputGroup}>
//               <span className={styles.passwordLabel}>
//                 <span>Password</span>
//                 <button
//                   type="button"
//                   className={styles.forgotButton}
//                   onClick={() => router.push("/auth/forgot-password")}
//                 >
//                   Forgot password?
//                 </button>
//               </span>

//               <div className={styles.inputWrap}>
//                 <svg viewBox="0 0 24 24" aria-hidden="true">
//                   <rect
//                     x="5"
//                     y="10"
//                     width="14"
//                     height="10"
//                     rx="2"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                   />
//                   <path
//                     d="M8 10V7a4 4 0 0 1 8 0v3"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                   />
//                 </svg>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   autoComplete="current-password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(event) => {
//                     setPassword(event.target.value);
//                     setError("");
//                   }}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className={styles.passwordToggle}
//                   onClick={() => setShowPassword((current) => !current)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </label>

//             <label className={styles.remember}>
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(event) => setRememberMe(event.target.checked)}
//                 disabled={loading}
//               />
//               <span className={styles.customCheckbox} />
//               <span>Keep me signed in</span>
//             </label>

//             {error ? (
//               <div className={styles.error} role="alert">
//                 <span>!</span>
//                 <p>{error}</p>
//               </div>
//             ) : null}

//             <button className={styles.submitButton} type="submit" disabled={loading}>
//               {loading ? (
//                 <>
//                   <span className={styles.spinner} />
//                   Signing in...
//                 </>
//               ) : (
//                 <>
//                   Sign in as {selectedRoleInfo.title}
//                   <span aria-hidden="true">→</span>
//                 </>
//               )}
//             </button>
//           </form>

//           <div className={styles.divider}>
//             <span />
//             <small>SECURE ACCESS</small>
//             <span />
//           </div>

//           <p className={styles.signupText}>
//             New to LOOP?{" "}
//             <button type="button" onClick={() => router.push("/auth/signup")}>
//               Create an account
//             </button>
//           </p>

//           <p className={styles.legal}>
//             By continuing, you agree to LOOP&apos;s Terms of Service and Privacy Policy.
//           </p>
//         </div>
//       </section>
//     </main>
//   );
// }

"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./login.module.css";
import { loginUser } from "../../../lib/api/auth";
import { saveAuthSession } from "../../../lib/auth/auth-storage";
import type {
  AuthRole,
  LoginResponse,
  LoginRole,
} from "../../../types/auth.types";

const roles: Array<{
  id: LoginRole;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: "ADMIN",
    title: "Admin",
    description:
      "Manage workspace, users, feedback and settings.",
    icon: "A",
  },
  {
    id: "ANALYST",
    title: "Analyst",
    description:
      "Analyze feedback, trends, themes and reports.",
    icon: "AN",
  },
  {
    id: "VIEWER",
    title: "Viewer",
    description:
      "View dashboards, insights and published reports.",
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

function normalizeRole(role: unknown): AuthRole | null {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toUpperCase();

  if (
    normalized === "ADMIN" ||
    normalized === "ANALYST" ||
    normalized === "VIEWER"
  ) {
    return normalized;
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign in. Please check your details and try again.";
}

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] =
    useState<LoginRole>("ADMIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const selectedRoleInfo = useMemo(
    () =>
      roles.find(
        (role) => role.id === selectedRole,
      ) ?? roles[0],
    [selectedRole],
  );

  function clearError() {
    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your work email.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      setError(
        "Please enter a valid work email address.",
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response: LoginResponse =
        await loginUser({
          email: normalizedEmail,
          password,
        });

      const userRole = normalizeRole(
        response?.user?.role,
      );

      if (!userRole) {
        throw new Error(
          "Your account has an invalid role. Please contact an administrator.",
        );
      }

      /*
       * The role returned by the backend is authoritative.
       * We do not change it on the frontend.
       */
      if (userRole !== selectedRole) {
        const actualRole =
          userRole === "ADMIN"
            ? "Admin"
            : userRole === "ANALYST"
              ? "Analyst"
              : "Viewer";

        const selectedRoleName =
          selectedRole === "ADMIN"
            ? "Admin"
            : selectedRole === "ANALYST"
              ? "Analyst"
              : "Viewer";

        throw new Error(
          `This account is registered as ${actualRole}. Please select ${actualRole} instead of ${selectedRoleName}.`,
        );
      }

      saveAuthSession(
        response,
        rememberMe,
      );

      router.replace(
        getRoleRoute(userRole),
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.visualPanel}
        aria-label="LOOP product introduction"
      >
        <div className={styles.visualGlowOne} />
        <div className={styles.visualGlowTwo} />

        <header className={styles.brand}>
          <div className={styles.brandMark}>
            L
          </div>

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
            Understand what customers are saying,
            discover the themes that matter and make
            faster decisions with AI-powered insights.
          </p>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div>
                <span
                  className={styles.previewLabel}
                >
                  CUSTOMER SENTIMENT
                </span>

                <strong>
                  Weekly overview
                </strong>
              </div>

              <span
                className={styles.liveBadge}
              >
                LIVE
              </span>
            </div>

            <div className={styles.chart}>
              <span
                className={styles.chartLine}
              />

              <span
                className={styles.chartLine}
              />

              <span
                className={styles.chartLine}
              />

              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
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

        <footer
          className={styles.visualFooter}
        >
          <span>
            AI-powered feedback intelligence
          </span>

          <span>
            Secure workspace access
          </span>
        </footer>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.mobileBrand}>
          <div className={styles.brandMark}>
            L
          </div>

          <span>LOOP</span>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <span
              className={styles.formEyebrow}
            >
              WELCOME BACK
            </span>

            <h2>Sign in to LOOP</h2>

            <p>
              Access your customer feedback
              workspace.
            </p>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset
              className={styles.roleFieldset}
              disabled={loading}
            >
              <legend>Continue as</legend>

              <div className={styles.roleGrid}>
                {roles.map((role) => {
                  const active =
                    selectedRole === role.id;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      className={`${styles.roleCard} ${
                        active
                          ? styles.roleCardActive
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedRole(
                          role.id,
                        );
                        clearError();
                      }}
                      aria-pressed={active}
                    >
                      <span
                        className={
                          styles.roleIcon
                        }
                      >
                        {role.icon}
                      </span>

                      <span
                        className={
                          styles.roleText
                        }
                      >
                        <strong>
                          {role.title}
                        </strong>

                        <small>
                          {role.description}
                        </small>
                      </span>

                      <span
                        className={
                          styles.radio
                        }
                      >
                        {active && (
                          <span />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div
              className={
                styles.selectedRole
              }
            >
              <span
                className={
                  styles.selectedRoleIcon
                }
              >
                {selectedRoleInfo.icon}
              </span>

              <div>
                <span>
                  Selected workspace role
                </span>

                <strong>
                  {selectedRoleInfo.title}
                </strong>
              </div>
            </div>

            <label
              className={styles.inputGroup}
            >
              <span>Work email</span>

              <div
                className={
                  styles.inputWrap
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6h16v12H4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="m4 7 8 6 8-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value,
                    );
                    clearError();
                  }}
                  disabled={loading}
                  required
                />
              </div>
            </label>

            <label
              className={styles.inputGroup}
            >
              <span
                className={
                  styles.passwordLabel
                }
              >
                <span>Password</span>

                <button
                  type="button"
                  className={
                    styles.forgotButton
                  }
                  onClick={() =>
                    router.push(
                      "/auth/forget-password",
                    )
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </span>

              <div
                className={
                  styles.inputWrap
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    );
                    clearError();
                  }}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className={
                    styles.passwordToggle
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </label>

            <label
              className={styles.remember}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked,
                  )
                }
                disabled={loading}
              />

              <span
                className={
                  styles.customCheckbox
                }
              />

              <span>
                Keep me signed in
              </span>
            </label>

            {error ? (
              <div
                className={styles.error}
                role="alert"
              >
                <span>!</span>
                <p>{error}</p>
              </div>
            ) : null}

            <button
              className={
                styles.submitButton
              }
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className={
                      styles.spinner
                    }
                  />

                  Signing in...
                </>
              ) : (
                <>
                  Sign in as{" "}
                  {selectedRoleInfo.title}

                  <span
                    aria-hidden="true"
                  >
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            <small>SECURE ACCESS</small>
            <span />
          </div>

          <p
            className={
              styles.signupText
            }
          >
            New to LOOP?{" "}
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/auth/signup",
                )
              }
              disabled={loading}
            >
              Create an account
            </button>
          </p>

          <p className={styles.legal}>
            By continuing, you agree to
            LOOP&apos;s Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}