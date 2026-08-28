
"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import styles from "./signup.module.css";

import { signupUser } from "../../../lib/api/auth";
import { getErrorMessage as getApiErrorMessage } from "../../../lib/api/api-error";

type SignupRole =
  | "ANALYST"
  | "VIEWER";

const roles: Array<{
  id: SignupRole;
  title: string;
  description: string;
  icon: string;
}> = [
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

function getErrorMessage(
  error: unknown,
): string {
  if (
    isAxiosError(error) &&
    error.response?.status === 409
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  return getApiErrorMessage(error);
}

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] =
    useState<SignupRole>("ANALYST");

  const [name, setName] =
    useState("");

  const [workspaceName, setWorkspaceName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const selectedRole =
    roles.find(
      (item) => item.id === role,
    ) ?? roles[0];

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

    const normalizedName =
      name.trim();

    const normalizedWorkspaceName =
      workspaceName.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedName) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (normalizedName.length < 2) {
      setError(
        "Your name must contain at least 2 characters.",
      );
      return;
    }

    if (!normalizedWorkspaceName) {
      setError(
        "Please enter your workspace name.",
      );
      return;
    }

    if (normalizedWorkspaceName.length < 2) {
      setError(
        "Your workspace name must contain at least 2 characters.",
      );
      return;
    }

    if (!normalizedEmail) {
      setError(
        "Please enter your work email.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please create a password.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await signupUser({
          name: normalizedName,
          workspaceName: normalizedWorkspaceName,
          email: normalizedEmail,
          password,
          role,
        });

      /*
       * Do not trust the role selected by the
       * browser for authorization.
       *
       * The backend response is authoritative.
       */
      const returnedRole =
        response.user.role;

      if (
        returnedRole !== "ANALYST" &&
        returnedRole !== "VIEWER"
      ) {
        throw new Error(
          "The server returned an invalid signup role.",
        );
      }

      router.replace(
        `/auth/login?role=${returnedRole.toLowerCase()}&registered=true`,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.visualPanel}
      >
        <div
          className={styles.visualGlowOne}
        />

        <div
          className={styles.visualGlowTwo}
        />

        <header
          className={styles.brand}
        >
          <div
            className={styles.brandMark}
          >
            L
          </div>

          <span>LOOP</span>
        </header>

        <div
          className={styles.visualContent}
        >
          <div
            className={styles.eyebrow}
          >
            <span
              className={styles.eyebrowDot}
            />

            AI CUSTOMER FEEDBACK PLATFORM
          </div>

          <h1>
            Understand feedback.
            <span>
              {" "}
              Make better decisions.
            </span>
          </h1>

          <p>
            Join LOOP and get access to
            customer feedback intelligence
            built for your role.
          </p>

          <div
            className={styles.featureCard}
          >
            <div
              className={
                styles.featureIcon
              }
            >
              {selectedRole.icon}
            </div>

            <div>
              <strong>
                {selectedRole.title}
              </strong>

              <span>
                {selectedRole.description}
              </span>
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

      <section
        className={styles.formPanel}
      >
        <div
          className={
            styles.mobileBrand
          }
        >
          <div
            className={styles.brandMark}
          >
            L
          </div>

          <span>LOOP</span>
        </div>

        <div
          className={
            styles.formContainer
          }
        >
          <div
            className={styles.formHeader}
          >
            <span
              className={
                styles.formEyebrow
              }
            >
              GET STARTED
            </span>

            <h2>
              Create your LOOP account
            </h2>

            <p>
              Choose your workspace role
              and create your account.
            </p>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset
              className={
                styles.roleFieldset
              }
              disabled={loading}
            >
              <legend>
                Choose your role
              </legend>

              <div
                className={
                  styles.roleGrid
                }
              >
                {roles.map(
                  (item) => {
                    const active =
                      role === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.roleCard} ${
                          active
                            ? styles.roleCardActive
                            : ""
                        }`}
                        onClick={() => {
                          setRole(
                            item.id,
                          );
                          clearError();
                        }}
                        aria-pressed={
                          active
                        }
                      >
                        <span
                          className={
                            styles.roleIcon
                          }
                        >
                          {item.icon}
                        </span>

                        <span
                          className={
                            styles.roleText
                          }
                        >
                          <strong>
                            {item.title}
                          </strong>

                          <small>
                            {
                              item.description
                            }
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
                  },
                )}
              </div>
            </fieldset>

            <label
              className={
                styles.inputGroup
              }
            >
              <span>
                Full name
              </span>

              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChange={(event) => {
                  setName(
                    event.target.value,
                  );
                  clearError();
                }}
                disabled={loading}
              />
            </label>

            <label
              className={
                styles.inputGroup
              }
            >
              <span>
                Workspace name
              </span>

              <input
                type="text"
                name="workspaceName"
                autoComplete="organization"
                placeholder="Your company or team"
                value={workspaceName}
                onChange={(event) => {
                  setWorkspaceName(
                    event.target.value,
                  );
                  clearError();
                }}
                disabled={loading}
                required
              />
            </label>

            <label
              className={
                styles.inputGroup
              }
            >
              <span>
                Work email
              </span>

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
              />
            </label>

            <label
              className={
                styles.inputGroup
              }
            >
              <span>
                Password
              </span>

              <div
                className={
                  styles.passwordWrap
                }
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    );
                    clearError();
                  }}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </label>

            <label
              className={
                styles.inputGroup
              }
            >
              <span>
                Confirm password
              </span>

              <div
                className={
                  styles.passwordWrap
                }
              >
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value,
                    );
                    clearError();
                  }}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current,
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </label>

            <div
              className={
                styles.passwordHint
              }
            >
              Use at least 8 characters.
            </div>

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
              {loading
                ? "Creating account..."
                : `Create ${selectedRole.title} account`}

              {!loading && (
                <span
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </button>

            <p
              className={
                styles.loginText
              }
            >
              Already have an account?{" "}
              <Link
                href={`/auth/login?role=${role.toLowerCase()}`}
              >
                Sign in
              </Link>
            </p>
          </form>

          <p className={styles.legal}>
            By creating an account, you
            agree to LOOP&apos;s Terms of
            Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
