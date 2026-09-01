
"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  deleteFeedback,
} from "../../../../Features/feedback/api/feedback.api";

import {
  useFeedbackInbox,
} from "../../../../Features/feedback/hooks/useFeedbackInbox";

import type {
  Feedback,
  FeedbackSentiment,
  FeedbackSource,
  FeedbackStatus,
} from "../../../../Features/feedback/feedback.types";

import styles from "./inbox.module.css";

/* -------------------------------------------------------------------------- */
/* Options                                                                    */
/* -------------------------------------------------------------------------- */

const SOURCE_OPTIONS: {
  value: FeedbackSource;
  label: string;
}[] = [
  {
    value: "SUPPORT",
    label: "Support",
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

const STATUS_OPTIONS: {
  value: FeedbackStatus;
  label: string;
}[] = [
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "REVIEWED",
    label: "Reviewed",
  },
  {
    value: "ACTIONED",
    label: "Actioned",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
];

const SENTIMENT_OPTIONS: {
  value: FeedbackSentiment;
  label: string;
}[] = [
  {
    value: "POSITIVE",
    label: "Positive",
  },
  {
    value: "NEUTRAL",
    label: "Neutral",
  },
  {
    value: "NEGATIVE",
    label: "Negative",
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSourceLabel(
  source: FeedbackSource,
) {
  return (
    SOURCE_OPTIONS.find(
      (item) => item.value === source,
    )?.label ?? source
  );
}

function getStatusLabel(
  status: FeedbackStatus,
) {
  return (
    STATUS_OPTIONS.find(
      (item) => item.value === status,
    )?.label ?? status
  );
}

function getSentimentLabel(
  sentiment: FeedbackSentiment,
) {
  return (
    SENTIMENT_OPTIONS.find(
      (item) => item.value === sentiment,
    )?.label ?? sentiment
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AnalystInboxPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [source, setSource] =
    useState<FeedbackSource | "">("");

  const [status, setStatus] =
    useState<FeedbackStatus | "">("");

  const [sentiment, setSentiment] =
    useState<FeedbackSentiment | "">("");

  const [category, setCategory] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pageSize] =
    useState(10);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedFeedback, setSelectedFeedback] =
    useState<Feedback | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Query                                                                    */
  /* ------------------------------------------------------------------------ */

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: search || undefined,
      source: source || undefined,
      status: status || undefined,
      sentiment: sentiment || undefined,
      category: category || undefined,
    }),
    [
      page,
      pageSize,
      search,
      source,
      status,
      sentiment,
      category,
    ],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFeedbackInbox(queryParams);

  /* ------------------------------------------------------------------------ */
  /* IMPORTANT: Backend returns                                               */
  /*                                                                          */
  /* data = {                                                                  */
  /*   items,                                                                  */
  /*   total,                                                                  */
  /*   page,                                                                   */
  /*   limit,                                                                  */
  /*   totalPages                                                              */
  /* }                                                                         */
  /* ------------------------------------------------------------------------ */

  const feedback = data?.items ?? [];

  const total = data?.total ?? 0;

  const totalPages = Math.max(
    1,
    data?.totalPages ?? 1,
  );

  /* ------------------------------------------------------------------------ */
  /* Page metrics                                                              */
  /* ------------------------------------------------------------------------ */

  const metrics = useMemo(() => {
    return {
      total,

      newCount: feedback.filter(
        (item) =>
          item.status === "NEW",
      ).length,

      positive: feedback.filter(
        (item) =>
          item.sentiment ===
          "POSITIVE",
      ).length,

      negative: feedback.filter(
        (item) =>
          item.sentiment ===
          "NEGATIVE",
      ).length,

      classified: feedback.filter(
        (item) =>
          item.isClassified === true,
      ).length,
    };
  }, [feedback, total]);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleSearch = useCallback(() => {
    setPage(1);
    setSearch(searchInput.trim());
  }, [searchInput]);

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                   */
  /* ------------------------------------------------------------------------ */

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setSource("");
    setStatus("");
    setSentiment("");
    setCategory("");
    setPage(1);
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(source) ||
    Boolean(status) ||
    Boolean(sentiment) ||
    Boolean(category);

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                    */
  /* ------------------------------------------------------------------------ */

  async function handleDelete(
    feedbackItem: Feedback,
  ) {
    const confirmed =
      window.confirm(
        `Delete this feedback${
          feedbackItem.customerName
            ? ` from ${feedbackItem.customerName}`
            : ""
        }?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(feedbackItem.id);

    try {
      await deleteFeedback(
        feedbackItem.id,
      );

      toast.success(
        "Feedback deleted successfully.",
      );

      if (
        feedback.length === 1 &&
        page > 1
      ) {
        setPage(
          (current) =>
            Math.max(1, current - 1),
        );
      } else {
        await refetch();
      }

      if (
        selectedFeedback?.id ===
        feedbackItem.id
      ) {
        setSelectedFeedback(null);
      }
    } catch (error: any) {
      console.error(
        "[INBOX] Delete error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          error?.message ??
          "Failed to delete feedback.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                                */
  /* ------------------------------------------------------------------------ */

  function goToPreviousPage() {
    setPage((current) =>
      Math.max(1, current - 1),
    );
  }

  function goToNextPage() {
    setPage((current) =>
      Math.min(
        totalPages,
        current + 1,
      ),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error message                                                             */
  /* ------------------------------------------------------------------------ */

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Failed to load feedback.";

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <main className={styles.page}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <MessageSquare size={15} />
            Customer Feedback
          </div>

          <h1>Feedback Inbox</h1>

          <p>
            Review, filter, and manage
            customer feedback from your
            workspace.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={17}
              className={
                isFetching
                  ? styles.spin
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() =>
              router.push(
                "/protected/analyst/add-feedback",
              )
            }
          >
            <Plus size={18} />
            Add Feedback
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Metrics                                                            */}
      {/* ------------------------------------------------------------------ */}

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <div
            className={`${styles.metricIcon} ${styles.totalIcon}`}
          >
            <MessageSquare size={19} />
          </div>

          <div>
            <span>Total Feedback</span>
            <strong>
              {metrics.total}
            </strong>
          </div>
        </article>

        <article className={styles.metricCard}>
          <div
            className={`${styles.metricIcon} ${styles.newIcon}`}
          >
            <Archive size={19} />
          </div>

          <div>
            <span>New</span>
            <strong>
              {metrics.newCount}
            </strong>
          </div>
        </article>

        <article className={styles.metricCard}>
          <div
            className={`${styles.metricIcon} ${styles.positiveIcon}`}
          >
            <span>+</span>
          </div>

          <div>
            <span>Positive</span>
            <strong>
              {metrics.positive}
            </strong>
          </div>
        </article>

        <article className={styles.metricCard}>
          <div
            className={`${styles.metricIcon} ${styles.negativeIcon}`}
          >
            <span>−</span>
          </div>

          <div>
            <span>Negative</span>
            <strong>
              {metrics.negative}
            </strong>
          </div>
        </article>

        <article className={styles.metricCard}>
          <div
            className={`${styles.metricIcon} ${styles.classifiedIcon}`}
          >
            <span>AI</span>
          </div>

          <div>
            <span>AI Classified</span>
            <strong>
              {metrics.classified}
            </strong>
          </div>
        </article>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Search / filters                                                   */}
      {/* ------------------------------------------------------------------ */}

      <section className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} />

          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value,
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Search feedback, customer, category..."
          />

          {searchInput && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`${styles.filterButton} ${
            showFilters
              ? styles.filterButtonActive
              : ""
          }`}
          onClick={() =>
            setShowFilters(
              (current) => !current,
            )
          }
        >
          <Filter size={17} />
          Filters

          {hasFilters && (
            <span
              className={styles.filterBadge}
            >
              !
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            className={styles.clearFilters}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </section>

      {showFilters && (
        <section className={styles.filterPanel}>
          <div className={styles.filterField}>
            <label>Source</label>

            <select
              value={source}
              onChange={(event) => {
                setSource(
                  event.target
                    .value as FeedbackSource | "",
                );
                setPage(1);
              }}
            >
              <option value="">
                All sources
              </option>

              {SOURCE_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className={styles.filterField}>
            <label>Status</label>

            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target
                    .value as FeedbackStatus | "",
                );
                setPage(1);
              }}
            >
              <option value="">
                All statuses
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className={styles.filterField}>
            <label>Sentiment</label>

            <select
              value={sentiment}
              onChange={(event) => {
                setSentiment(
                  event.target
                    .value as FeedbackSentiment | "",
                );
                setPage(1);
              }}
            >
              <option value="">
                All sentiment
              </option>

              {SENTIMENT_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className={styles.filterField}>
            <label>Category</label>

            <select
              value={category}
              onChange={(event) => {
                setCategory(
                  event.target.value,
                );
                setPage(1);
              }}
            >
              <option value="">
                All categories
              </option>

              {CATEGORY_OPTIONS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <section className={styles.contentCard}>
        {isLoading ? (
          <div className={styles.state}>
            <Loader2
              size={32}
              className={styles.spin}
            />

            <h3>
              Loading feedback...
            </h3>

            <p>
              Getting feedback from your
              workspace.
            </p>
          </div>
        ) : isError ? (
          <div className={styles.state}>
            <div
              className={styles.errorIcon}
            >
              <AlertCircle size={28} />
            </div>

            <h3>
              Unable to load feedback
            </h3>

            <p>
              {errorMessage}
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => refetch()}
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        ) : feedback.length === 0 ? (
          <div className={styles.state}>
            <div
              className={styles.emptyIcon}
            >
              <MessageSquare
                size={30}
              />
            </div>

            <h3>
              {hasFilters
                ? "No matching feedback"
                : "No feedback yet"}
            </h3>

            <p>
              {hasFilters
                ? "Try changing or clearing your filters."
                : "Add your first customer feedback to get started."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={clearFilters}
              >
                <X size={17} />
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={() =>
                  router.push(
                    "/protected/analyst/inbox/add-feedback",
                  )
                }
              >
                <Plus size={17} />
                Add Feedback
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ---------------------------------------------------------- */}
            {/* Table                                                       */}
            {/* ---------------------------------------------------------- */}

            <div
              className={
                styles.tableWrapper
              }
            >
              <table
                className={styles.table}
              >
                <thead>
                  <tr>
                    <th>Feedback</th>
                    <th>Customer</th>
                    <th>Source</th>
                    <th>Category</th>
                    <th>Sentiment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className={styles.actionHeader}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {feedback.map(
                    (item) => (
                      <tr
                        key={item.id}
                      >
                        <td>
                          <button
                            type="button"
                            className={
                              styles.feedbackCell
                            }
                            onClick={() =>
                              setSelectedFeedback(
                                item,
                              )
                            }
                          >
                            <span>
                              {item.content}
                            </span>

                            {item.isClassified && (
                              <small>
                                AI classified
                              </small>
                            )}
                          </button>
                        </td>

                        <td>
                          <div
                            className={
                              styles.customer
                            }
                          >
                            <div
                              className={
                                styles.avatar
                              }
                            >
                              {item.customerName
                                ?.charAt(
                                  0,
                                )
                                .toUpperCase() ??
                                "C"}
                            </div>

                            <span>
                              {item.customerName ||
                                "Anonymous"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              styles.sourceBadge
                            }
                          >
                            {getSourceLabel(
                              item.source,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              styles.category
                            }
                          >
                            {item.category ||
                              "Uncategorized"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`${styles.badge} ${
                              styles[
                                `sentiment_${item.sentiment.toLowerCase()}`
                              ]
                            }`}
                          >
                            {getSentimentLabel(
                              item.sentiment,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`${styles.badge} ${
                              styles[
                                `status_${item.status.toLowerCase()}`
                              ]
                            }`}
                          >
                            {getStatusLabel(
                              item.status,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              styles.date
                            }
                          >
                            {formatDate(
                              item.feedbackDate ??
                                item.createdAt,
                            )}
                          </span>
                        </td>

                        <td>
                          <div
                            className={
                              styles.rowActions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.iconButton
                              }
                              title="View feedback"
                              onClick={() =>
                                setSelectedFeedback(
                                  item,
                                )
                              }
                            >
                              <Eye
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              className={`${styles.iconButton} ${styles.deleteButton}`}
                              title="Delete feedback"
                              disabled={
                                deletingId ===
                                item.id
                              }
                              onClick={() =>
                                handleDelete(
                                  item,
                                )
                              }
                            >
                              {deletingId ===
                              item.id ? (
                                <Loader2
                                  size={17}
                                  className={
                                    styles.spin
                                  }
                                />
                              ) : (
                                <Trash2
                                  size={17}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Footer / pagination                                        */}
            {/* ---------------------------------------------------------- */}

            <footer
              className={
                styles.pagination
              }
            >
              <span>
                Showing{" "}
                <strong>
                  {Math.min(
                    (page - 1) *
                      pageSize +
                      1,
                    total,
                  )}
                </strong>{" "}
                –{" "}
                <strong>
                  {Math.min(
                    page * pageSize,
                    total,
                  )}
                </strong>{" "}
                of{" "}
                <strong>
                  {total}
                </strong>{" "}
                feedback
              </span>

              <div
                className={
                  styles.paginationControls
                }
              >
                <button
                  type="button"
                  onClick={
                    goToPreviousPage
                  }
                  disabled={page <= 1}
                >
                  <ChevronLeft
                    size={17}
                  />
                </button>

                <span>
                  Page{" "}
                  <strong>
                    {page}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {totalPages}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={
                    goToNextPage
                  }
                  disabled={
                    page >=
                    totalPages
                  }
                >
                  <ChevronRight
                    size={17}
                  />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Detail modal                                                       */}
      {/* ------------------------------------------------------------------ */}

      {selectedFeedback && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={() =>
            setSelectedFeedback(null)
          }
        >
          <section
            className={styles.modal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header
              className={styles.modalHeader}
            >
              <div>
                <span
                  className={
                    styles.modalEyebrow
                  }
                >
                  Feedback Details
                </span>

                <h2>
                  Customer Feedback
                </h2>
              </div>

              <button
                type="button"
                className={
                  styles.modalClose
                }
                onClick={() =>
                  setSelectedFeedback(
                    null,
                  )
                }
              >
                <X size={20} />
              </button>
            </header>

            <div
              className={
                styles.modalContent
              }
            >
              <div
                className={
                  styles.detailGrid
                }
              >
                <div>
                  <span>
                    Customer
                  </span>

                  <strong>
                    {selectedFeedback.customerName ||
                      "Anonymous"}
                  </strong>
                </div>

                <div>
                  <span>
                    Source
                  </span>

                  <strong>
                    {getSourceLabel(
                      selectedFeedback.source,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {selectedFeedback.category ||
                      "Uncategorized"}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatusLabel(
                      selectedFeedback.status,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Sentiment
                  </span>

                  <strong>
                    {getSentimentLabel(
                      selectedFeedback.sentiment,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDateTime(
                      selectedFeedback.feedbackDate ??
                        selectedFeedback.createdAt,
                    )}
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.feedbackDetail
                }
              >
                <span>
                  Feedback
                </span>

                <p>
                  {selectedFeedback.content}
                </p>
              </div>

              {selectedFeedback.aiSummary && (
                <div
                  className={
                    styles.aiSummary
                  }
                >
                  <span>
                    AI Summary
                  </span>

                  <p>
                    {
                      selectedFeedback.aiSummary
                    }
                  </p>
                </div>
              )}
            </div>

            <footer
              className={
                styles.modalFooter
              }
            >
              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={() =>
                  setSelectedFeedback(
                    null,
                  )
                }
              >
                Close
              </button>

              <button
                type="button"
                className={
                  styles.dangerButton
                }
                disabled={
                  deletingId ===
                  selectedFeedback.id
                }
                onClick={() =>
                  handleDelete(
                    selectedFeedback,
                  )
                }
              >
                {deletingId ===
                selectedFeedback.id ? (
                  <Loader2
                    size={17}
                    className={
                      styles.spin
                    }
                  />
                ) : (
                  <Trash2
                    size={17}
                  />
                )}

                Delete Feedback
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}