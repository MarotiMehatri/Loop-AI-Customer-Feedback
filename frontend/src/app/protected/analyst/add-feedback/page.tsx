"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createFeedback } from "../../../../Features/feedback/api/feedback.api";
import type { FeedbackSource } from "../../../../Features/feedback/feedback.types";

import styles from "./add-feedback.module.css";

const SOURCE_OPTIONS: {
  value: FeedbackSource;
  label: string;
}[] = [
  {
    value: "SUPPORT",
    label: "Support Ticket",
  },
  {
    value: "APP_STORE",
    label: "App Store",
  },
  {
    value: "SURVEY",
    label: "Survey",
  },
  {
    value: "SALES",
    label: "Sales",
  },
  {
    value: "SOCIAL",
    label: "Social Media",
  },
  {
    value: "WEBSITE",
    label: "Website",
  },
  {
    value: "EMAIL",
    label: "Email",
  },
  {
    value: "MANUAL",
    label: "Manual",
  },
];

const CATEGORY_OPTIONS = [
  "Checkout",
  "Product",
  "Pricing",
  "Support",
  "Performance",
  "Account",
  "Billing",
  "Delivery",
  "Feature Request",
  "Other",
];

function toLocalDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset();

  const local = new Date(date.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
}

export default function AnalystAddFeedbackPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [source, setSource] = useState<FeedbackSource>("SUPPORT");
  const [category, setCategory] = useState("Checkout");

  const [feedbackDate, setFeedbackDate] = useState(
    toLocalDateTimeValue(new Date()),
  );

  const [saving, setSaving] = useState(false);

  function goToDashboard() {
    router.push("/protected/analyst/");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanContent = content.trim();
    const cleanCustomerName = customerName.trim();
    const cleanCategory = category.trim();

    if (!cleanContent) {
      toast.error("Please enter feedback.");
      return;
    }

    if (cleanContent.length > 10000) {
      toast.error("Feedback is too long.");
      return;
    }

    if (!source) {
      toast.error("Please select a source.");
      return;
    }

    let isoDate: string | undefined;

    if (feedbackDate) {
      const parsed = new Date(feedbackDate);

      if (Number.isNaN(parsed.getTime())) {
        toast.error("Please select a valid feedback date.");
        return;
      }

      isoDate = parsed.toISOString();
    }

    const payload = {
      content: cleanContent,

      ...(cleanCustomerName
        ? {
            customerName: cleanCustomerName,
          }
        : {}),

      source,

      ...(cleanCategory
        ? {
            category: cleanCategory,
          }
        : {}),

      ...(isoDate
        ? {
            feedbackDate: isoDate,
          }
        : {}),
    };

    console.log(
      "[ADD FEEDBACK] POST /feedback payload:",
      JSON.stringify(payload, null, 2),
    );

    setSaving(true);

    try {
      const created = await createFeedback(payload);

      console.log("[ADD FEEDBACK] Created:", created);

      toast.success("Feedback added successfully.");

      router.push("/protected/analyst/inbox");

      router.refresh();
    } catch (error: any) {
      console.error("[ADD FEEDBACK] STATUS:", error?.response?.status);

      console.error("[ADD FEEDBACK] RESPONSE:", error?.response?.data);

      console.error("[ADD FEEDBACK] ERROR:", error);

      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        "Failed to add feedback.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      {/* Background decoration */}
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.backButton}
            onClick={goToDashboard}
            disabled={saving}
            aria-label="Back to analyst dashboard"
          >
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>

          <div className={styles.breadcrumb}>
            <span>Analyst</span>
            <span className={styles.breadcrumbSlash}>/</span>
            <strong>Add Feedback</strong>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className={styles.content}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <MessageSquare size={25} />
          </div>

          <div className={styles.heroText}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Customer Voice
            </div>

            <h1>Add Feedback</h1>

            <p>
              Capture customer feedback and keep your workspace insights up to
              date.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form className={styles.formCard} onSubmit={handleSubmit}>
          {/* Section heading */}
          <div className={styles.sectionHeader}>
            <div>
              <h2>Feedback Details</h2>

              <p>
                Add the customer's message and provide useful context for
                analysis.
              </p>
            </div>

            <div className={styles.requiredBadge}>
              <span>*</span>
              Required
            </div>
          </div>

          <div className={styles.divider} />

          {/* Feedback */}
          <label className={styles.field}>
            <div className={styles.labelRow}>
              <span className={styles.label}>
                Feedback
                <span className={styles.required}>*</span>
              </span>

              <span
                className={
                  content.length > 9500 ? styles.counterWarning : styles.counter
                }
              >
                {content.length.toLocaleString()}
                {" / "}
                10,000
              </span>
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter the customer's feedback..."
              rows={7}
              maxLength={10000}
              disabled={saving}
              required
              className={styles.textarea}
            />

            <span className={styles.fieldHint}>
              Write the customer's feedback exactly as provided when possible.
            </span>
          </label>

          {/* Grid */}
          <div className={styles.grid}>
            {/* Customer Name */}
            <label className={styles.field}>
              <span className={styles.label}>Customer Name</span>

              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="e.g. Maroti Mehatri"
                maxLength={200}
                disabled={saving}
                className={styles.input}
              />
            </label>

            {/* Source */}
            <label className={styles.field}>
              <span className={styles.label}>
                Source
                <span className={styles.required}>*</span>
              </span>

              <select
                value={source}
                onChange={(event) =>
                  setSource(event.target.value as FeedbackSource)
                }
                disabled={saving}
                required
                className={styles.select}
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Category */}
            <label className={styles.field}>
              <span className={styles.label}>Category</span>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={saving}
                className={styles.select}
              >
                <option value="">Select category</option>

                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {/* Date */}
            <label className={styles.field}>
              <span className={styles.label}>Feedback Date</span>

              <div className={styles.dateWrapper}>
                <CalendarDays size={18} className={styles.dateIcon} />

                <input
                  type="datetime-local"
                  value={feedbackDate}
                  onChange={(event) => setFeedbackDate(event.target.value)}
                  disabled={saving}
                  className={styles.dateInput}
                />
              </div>
            </label>
          </div>

          {/* Workspace information */}
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>
              <CheckCircle2 size={19} />
            </div>

            <div className={styles.infoContent}>
              <strong>Workspace scoped</strong>

              <p>
                This feedback will automatically be saved to your current
                workspace. The authenticated user will be recorded as the
                creator.
              </p>
            </div>
          </div>

          {/* Actions */}
          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={goToDashboard}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              <Save size={17} />

              <span>{saving ? "Saving Feedback..." : "Save Feedback"}</span>
            </button>
          </footer>
        </form>

        {/* Footer note */}
        <p className={styles.footerNote}>
          Feedback can be analyzed later for sentiment, themes, categories, and
          customer insights.
        </p>
      </section>
    </main>
  );
}
