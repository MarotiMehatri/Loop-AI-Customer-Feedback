
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Home,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import styles from "./logout.module.css";

type LogoutStatus = "logging-out" | "success" | "error";

const REDIRECT_SECONDS = 3;

export default function AnalystLogoutPage() {
  const router = useRouter();

  const [status, setStatus] =
    useState<LogoutStatus>("logging-out");

  const [countdown, setCountdown] =
    useState(REDIRECT_SECONDS);

  const [errorMessage, setErrorMessage] = useState("");

  const redirectToLogin = useCallback(() => {
    router.replace("/auth/login");
  }, [router]);

  useEffect(() => {
    let mounted = true;
    let redirectTimer: ReturnType<typeof setTimeout> | null =
      null;

    const logout = async () => {
      try {
        /*
         * ============================================
         * CLEAR AUTHENTICATION DATA
         * ============================================
         */

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Other possible authentication keys
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage");

        /*
         * ============================================
         * CLEAR SESSION DATA
         * ============================================
         */

        sessionStorage.clear();

        /*
         * ============================================
         * SUCCESS STATE
         * ============================================
         */

        if (!mounted) return;

        setStatus("success");
        setCountdown(REDIRECT_SECONDS);

        /*
         * ============================================
         * COUNTDOWN
         * ============================================
         */

        let seconds = REDIRECT_SECONDS;

        const countdownTimer = window.setInterval(() => {
          seconds -= 1;

          if (!mounted) {
            window.clearInterval(countdownTimer);
            return;
          }

          setCountdown(seconds);

          if (seconds <= 0) {
            window.clearInterval(countdownTimer);
            redirectToLogin();
          }
        }, 1000);

        /*
         * Safety fallback in case the interval
         * does not execute correctly.
         */
        redirectTimer = setTimeout(() => {
          if (mounted) {
            redirectToLogin();
          }
        }, (REDIRECT_SECONDS + 1) * 1000);
      } catch (error) {
        console.error("Analyst logout failed:", error);

        if (!mounted) return;

        setStatus("error");

        setErrorMessage(
          "We could not complete the logout cleanup. Please continue to the login page."
        );
      }
    };

    logout();

    return () => {
      mounted = false;

      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectToLogin]);

  /*
   * ================================================
   * LOGGING OUT
   * ================================================
   */

  if (status === "logging-out") {
    return (
      <main className={styles.page}>
        <section
          className={styles.card}
          aria-live="polite"
          aria-busy="true"
        >
          <div className={styles.iconWrapper}>
            <Loader2
              size={32}
              strokeWidth={2}
              className={styles.spinner}
            />
          </div>

          <span className={styles.statusBadge}>
            <ShieldCheck size={15} />
            Secure session
          </span>

          <h1>Logging out...</h1>

          <p className={styles.description}>
            Your LOOP Analyst session is being securely closed.
          </p>

          <div className={styles.loadingBox}>
            <Loader2
              size={19}
              className={styles.spinner}
            />

            <span>Signing you out</span>
          </div>

          <div className={styles.securityMessage}>
            <ShieldCheck size={17} />

            <span>
              Your authentication information is being removed
              from this browser.
            </span>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ================================================
   * SUCCESS
   * ================================================
   */

  if (status === "success") {
    return (
      <main className={styles.page}>
        <section
          className={styles.card}
          aria-live="polite"
        >
          <div
            className={`${styles.iconWrapper} ${styles.successIcon}`}
          >
            <CheckCircle2
              size={34}
              strokeWidth={2}
            />
          </div>

          <span
            className={`${styles.statusBadge} ${styles.successBadge}`}
          >
            <CheckCircle2 size={15} />
            Logout successful
          </span>

          <h1>You’re signed out</h1>

          <p className={styles.description}>
            Your LOOP Analyst session has been successfully
            closed.
          </p>

          <div className={styles.successMessage}>
            <ShieldCheck size={19} />

            <div>
              <strong>Your session is secure</strong>

              <span>
                Authentication data has been cleared from this
                browser.
              </span>
            </div>
          </div>

          <div className={styles.redirectMessage}>
            <Loader2
              size={18}
              className={styles.spinner}
            />

            <span>
              Redirecting to login in{" "}
              <strong>{countdown}</strong>{" "}
              {countdown === 1 ? "second" : "seconds"}...
            </span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={redirectToLogin}
            >
              <LogIn size={19} />
              Continue to Login
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.replace("/")}
            >
              <Home size={18} />
              Go to Home
            </button>
          </div>

          <p className={styles.footerText}>
            Thank you for using LOOP.
          </p>
        </section>
      </main>
    );
  }

  /*
   * ================================================
   * ERROR
   * ================================================
   */

  return (
    <main className={styles.page}>
      <section
        className={styles.card}
        aria-live="assertive"
      >
        <div
          className={`${styles.iconWrapper} ${styles.errorIcon}`}
        >
          <TriangleAlert
            size={34}
            strokeWidth={2}
          />
        </div>

        <span
          className={`${styles.statusBadge} ${styles.errorBadge}`}
        >
          <TriangleAlert size={15} />
          Logout warning
        </span>

        <h1>Logout needs attention</h1>

        <p className={styles.description}>
          {errorMessage}
        </p>

        <div className={styles.warningMessage}>
          <TriangleAlert size={19} />

          <div>
            <strong>Please continue to login</strong>

            <span>
              You can safely return to the login page and sign
              in again.
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={redirectToLogin}
          >
            <LogIn size={19} />
            Go to Login
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => router.replace("/")}
          >
            <Home size={18} />
            Go to Home
          </button>
        </div>

        <p className={styles.footerText}>
          If the problem continues, please contact your
          workspace administrator.
        </p>
      </section>
    </main>
  );
}
