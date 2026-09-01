"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createExport,
  deleteExport,
  downloadExport,
  listExports,
  retryExport,
} from "../../../../Features/exports/api/exports.api";

import type {
  CreateExportPayload,
  ExportJob,
} from "../../../../Features/exports/exports.types";

import styles from "./exports.module.css";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ExportType = "feedback" | "analytics" | "themes" | "reports";

type ExportFormat = "CSV" | "XLSX" | "JSON" | "PDF";

interface ExportForm {
  name: string;
  type: ExportType;
  format: ExportFormat;
  startDate: string;
  endDate: string;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const EXPORT_TYPES: Array<{
  value: ExportType;
  label: string;
  description: string;
}> = [
  {
    value: "feedback",
    label: "Feedback Data",
    description: "Export customer feedback records.",
  },
  {
    value: "analytics",
    label: "Analytics",
    description: "Export analytics and performance data.",
  },
  {
    value: "themes",
    label: "Themes",
    description: "Export customer feedback themes.",
  },
  {
    value: "reports",
    label: "Reports",
    description: "Export generated reports.",
  },
];

const EXPORT_FORMATS: Array<{
  value: ExportFormat;
  label: string;
  description: string;
}> = [
  {
    value: "CSV",
    label: "CSV",
    description: "Comma-separated values",
  },
  {
    value: "XLSX",
    label: "Excel",
    description: "Microsoft Excel workbook",
  },
  {
    value: "JSON",
    label: "JSON",
    description: "Structured JSON data",
  },
  {
    value: "PDF",
    label: "PDF",
    description: "Portable document",
  },
];

const INITIAL_FORM: ExportForm = {
  name: "Weekly Customer Feedback Insights",
  type: "feedback",
  format: "CSV",
  startDate: "",
  endDate: "",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string | Date | null): string {
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

function formatDateTime(value?: string | Date | null): string {
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

function exportTypeLabel(type?: string): string {
  const normalized = String(type ?? "").toLowerCase();

  return (
    EXPORT_TYPES.find((item) => item.value === normalized)?.label ??
    type ??
    "Export"
  );
}

function formatLabel(format?: string): string {
  return (
    EXPORT_FORMATS.find(
      (item) => item.value === String(format ?? "").toUpperCase(),
    )?.label ??
    format ??
    "—"
  );
}

function statusLabel(status?: string): string {
  switch (String(status ?? "").toUpperCase()) {
    case "PENDING":
      return "Pending";

    case "PROCESSING":
      return "Processing";

    case "COMPLETED":
      return "Completed";

    case "FAILED":
      return "Failed";

    default:
      return status ?? "Unknown";
  }
}

function getExportFileUrl(data: any): string | null {
  return (
    data?.fileUrl ?? data?.url ?? data?.file?.url ?? data?.downloadUrl ?? null
  );
}

function getExportList(response: any): ExportJob[] {
  // Direct array
  if (Array.isArray(response)) {
    return response;
  }

  // Common response formats
  if (Array.isArray(response?.exports)) {
    return response.exports;
  }

  if (Array.isArray(response?.jobs)) {
    return response.jobs;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  // Nested data
  if (Array.isArray(response?.data?.exports)) {
    return response.data.exports;
  }

  if (Array.isArray(response?.data?.jobs)) {
    return response.data.jobs;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  // API response wrapper
  if (Array.isArray(response?.result?.exports)) {
    return response.result.exports;
  }

  if (Array.isArray(response?.result?.jobs)) {
    return response.result.jobs;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  console.warn("[EXPORT PAGE] Unknown listExports response:", response);

  return [];
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AnalystExportsPage() {
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState<ExportForm>(INITIAL_FORM);

  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [retryingId, setRetryingId] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Load Exports                                                             */
  /* ------------------------------------------------------------------------ */

  const loadExports = useCallback(async () => {
    try {
      setError("");

      const response = await listExports();

      setExports(getExportList(response));
    } catch (err: any) {
      console.error("Failed to load exports:", err);

      setError(err?.message ?? "Failed to load exports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadExports();
  }, [loadExports]);

  /* ------------------------------------------------------------------------ */
  /* Toast                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  /* ------------------------------------------------------------------------ */
  /* Filter                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredExports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return exports;
    }

    return exports.filter((item: any) => {
      return (
        String(item?.name ?? "")
          .toLowerCase()
          .includes(query) ||
        exportTypeLabel(item?.type).toLowerCase().includes(query) ||
        String(item?.format ?? "")
          .toLowerCase()
          .includes(query) ||
        String(item?.status ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [exports, search]);

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(() => {
    return {
      total: exports.length,

      pending: exports.filter(
        (item: any) => String(item?.status ?? "").toUpperCase() === "PENDING",
      ).length,

      processing: exports.filter(
        (item: any) =>
          String(item?.status ?? "").toUpperCase() === "PROCESSING",
      ).length,

      completed: exports.filter(
        (item: any) => String(item?.status ?? "").toUpperCase() === "COMPLETED",
      ).length,
    };
  }, [exports]);

  /* ------------------------------------------------------------------------ */
  /* Form                                                                     */
  /* ------------------------------------------------------------------------ */

  function updateForm(patch: Partial<ExportForm>) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function resetForm() {
    setForm({
      ...INITIAL_FORM,
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Create Export                                                            */
  /* ------------------------------------------------------------------------ */

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setToast({
        type: "error",
        message: "Export name is required.",
      });

      return;
    }

    if (form.startDate && form.endDate) {
      const start = new Date(`${form.startDate}T00:00:00`);

      const end = new Date(`${form.endDate}T23:59:59.999`);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setToast({
          type: "error",
          message: "Please enter valid dates.",
        });

        return;
      }

      if (start.getTime() > end.getTime()) {
        setToast({
          type: "error",
          message: "Start date cannot be after end date.",
        });

        return;
      }
    }

    setCreating(true);

    try {
      const payload = {
        name,
        type: form.type,
        format: form.format,
        filters: {},

        startDate: form.startDate
          ? new Date(`${form.startDate}T00:00:00`).toISOString()
          : undefined,

        endDate: form.endDate
          ? new Date(`${form.endDate}T23:59:59.999`).toISOString()
          : undefined,
      } as CreateExportPayload;

      console.log(
        "[EXPORT PAGE] FINAL CREATE EXPORT PAYLOAD:",
        JSON.stringify(payload, null, 2),
      );

      const created = await createExport(payload);

      console.log("[EXPORT PAGE] CREATED:", created);

      setExports((current) => [created, ...current]);

      resetForm();
      setShowCreate(false);

      setToast({
        type: "success",
        message: "Export created successfully.",
      });

      await loadExports();
    } catch (err: any) {
      console.error("Failed to create export:", err);

      setToast({
        type: "error",
        message: err?.message ?? "Failed to create export.",
      });
    } finally {
      setCreating(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Download                                                                 */
  /* ------------------------------------------------------------------------ */

  async function handleDownload(item: ExportJob) {
    const id = String((item as any)?.id ?? "");

    if (!id) {
      setToast({
        type: "error",
        message: "Export ID is missing.",
      });

      return;
    }

    setDownloadingId(id);

    try {
      const result = await downloadExport(id);

      const url = getExportFileUrl(result);

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setToast({
          type: "success",
          message: "Export download requested successfully.",
        });
      }
    } catch (err: any) {
      console.error("Failed to download export:", err);

      setToast({
        type: "error",
        message: err?.message ?? "Failed to download export.",
      });
    } finally {
      setDownloadingId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Retry                                                                    */
  /* ------------------------------------------------------------------------ */

  async function handleRetry(item: ExportJob) {
    const id = String((item as any)?.id ?? "");

    if (!id) {
      return;
    }

    setRetryingId(id);

    try {
      const result = await retryExport(id);

      setExports((current) =>
        current.map((existing) =>
          String((existing as any)?.id) === id ? result : existing,
        ),
      );

      setToast({
        type: "success",
        message: "Export retry started.",
      });

      await loadExports();
    } catch (err: any) {
      console.error("Failed to retry export:", err);

      setToast({
        type: "error",
        message: err?.message ?? "Failed to retry export.",
      });
    } finally {
      setRetryingId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  async function handleDelete(item: ExportJob) {
    const id = String((item as any)?.id ?? "").trim();

    const name = String((item as any)?.name ?? "this export").trim();

    if (!id) {
      setToast({
        type: "error",
        message: "Cannot delete export because the export ID is missing.",
      });

      return;
    }

    const confirmed = window.confirm(
      `Delete "${name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      console.log("[EXPORT PAGE] DELETE EXPORT:", id);

      await deleteExport(id);

      setExports((current) =>
        current.filter(
          (existing) => String((existing as any)?.id ?? "") !== id,
        ),
      );

      setToast({
        type: "success",
        message: "Export deleted successfully.",
      });
    } catch (error: any) {
      console.error("[EXPORT PAGE] Failed to delete export:", error);

      const status = error?.response?.status;

      const serverMessage =
        error?.response?.data?.message ?? error?.response?.data?.error;

      if (status === 404) {
        setToast({
          type: "error",
          message:
            serverMessage ??
            "Export delete endpoint was not found. Check the backend DELETE /exports/:id route.",
        });
      } else {
        setToast({
          type: "error",
          message:
            serverMessage ?? error?.message ?? "Failed to delete export.",
        });
      }
    } finally {
      setDeletingId(null);
    }
  }
  /* ------------------------------------------------------------------------ */
  /* Refresh                                                                  */
  /* ------------------------------------------------------------------------ */

  async function handleRefresh() {
    setRefreshing(true);
    await loadExports();
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Toast */}
        {toast && (
          <div
            className={`${styles.toast} ${
              toast.type === "success" ? styles.toastSuccess : styles.toastError
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={() => setToast(null)}
              className={styles.toastClose}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.titleIcon}>
              <FileDown size={23} />
            </div>

            <div>
              <h1 className={styles.title}>Exports</h1>

              <p className={styles.subtitle}>
                Create, manage and download workspace data exports.
              </p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className={styles.secondaryButton}
            >
              {refreshing ? (
                <Loader2 size={17} className={styles.spin} />
              ) : (
                <RefreshCw size={17} />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className={styles.primaryButton}
            >
              <Plus size={18} />
              New Export
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Exports</span>

            <strong className={styles.statValue}>{stats.total}</strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending</span>

            <strong className={styles.statValue}>{stats.pending}</strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Processing</span>

            <strong className={styles.statValue}>{stats.processing}</strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Completed</span>

            <strong className={styles.statValue}>{stats.completed}</strong>
          </div>
        </section>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={17} className={styles.searchIcon} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exports..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} />

            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <section className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Export</span>
            <span>Type</span>
            <span>Format</span>
            <span>Date Range</span>
            <span>Created</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className={styles.empty}>
              <div className={styles.loadingContent}>
                <Loader2 size={20} className={styles.spin} />
                Loading exports...
              </div>
            </div>
          ) : filteredExports.length === 0 ? (
            <div className={styles.empty}>
              <FileDown size={38} className={styles.emptyIcon} />

              <div className={styles.emptyTitle}>
                {search ? "No exports found" : "No exports yet"}
              </div>

              <div className={styles.emptyDescription}>
                {search
                  ? "Try a different search."
                  : "Create your first export to get started."}
              </div>
            </div>
          ) : (
            filteredExports.map((item: any) => {
              const id = String(item?.id ?? "");

              const status = String(item?.status ?? "PENDING").toUpperCase();

              return (
                <div key={id} className={styles.row}>
                  {/* Export */}
                  <div>
                    <div className={styles.name}>
                      {item?.name ?? "Untitled Export"}
                    </div>

                    <div className={styles.muted}>Export ID: {id || "—"}</div>
                  </div>

                  {/* Type */}
                  <div className={styles.muted}>
                    {exportTypeLabel(item?.type)}
                  </div>

                  {/* Format */}
                  <div className={styles.formatCell}>
                    {String(item?.format ?? "").toUpperCase() === "CSV" ? (
                      <FileText size={15} />
                    ) : String(item?.format ?? "").toUpperCase() === "XLSX" ? (
                      <FileSpreadsheet size={15} />
                    ) : String(item?.format ?? "").toUpperCase() === "JSON" ? (
                      <FileJson size={15} />
                    ) : (
                      <FileText size={15} />
                    )}

                    {formatLabel(item?.format)}
                  </div>

                  {/* Date */}
                  <div className={styles.muted}>
                    {item?.startDate || item?.endDate ? (
                      <>
                        {formatDate(item?.startDate)}
                        {" – "}
                        {formatDate(item?.endDate)}
                      </>
                    ) : (
                      "All dates"
                    )}
                  </div>

                  {/* Created */}
                  <div className={styles.muted}>
                    {formatDateTime(item?.createdAt)}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`${styles.status} ${
                        status === "COMPLETED"
                          ? styles.statusCompleted
                          : status === "FAILED"
                            ? styles.statusFailed
                            : status === "PROCESSING"
                              ? styles.statusProcessing
                              : styles.statusPending
                      }`}
                    >
                      {statusLabel(status)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={styles.actions}>
                    {status === "COMPLETED" && (
                      <button
                        type="button"
                        title="Download"
                        aria-label="Download export"
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === id}
                        className={styles.iconButton}
                      >
                        {downloadingId === id ? (
                          <Loader2 size={16} className={styles.spin} />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                    )}

                    {status === "FAILED" && (
                      <button
                        type="button"
                        title="Retry"
                        aria-label="Retry export"
                        onClick={() => handleRetry(item)}
                        disabled={retryingId === id}
                        className={styles.iconButton}
                      >
                        {retryingId === id ? (
                          <Loader2 size={16} className={styles.spin} />
                        ) : (
                          <RefreshCw size={16} />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete export"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === id}
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                    >
                      {deletingId === id ? (
                        <Loader2 size={16} className={styles.spin} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Create Export Modal                                                */}
      {/* ------------------------------------------------------------------ */}

      {showCreate && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (!creating) {
                setShowCreate(false);
              }
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>New Export</h2>

                <p className={styles.modalSubtitle}>
                  Create a new workspace data export.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !creating && setShowCreate(false)}
                disabled={creating}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className={styles.modalBody}>
                {/* Export Name */}
                <div className={styles.field}>
                  <label htmlFor="export-name" className={styles.label}>
                    Export Name
                  </label>

                  <input
                    id="export-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm({
                        name: event.target.value,
                      })
                    }
                    placeholder="Weekly Customer Feedback Insights"
                    disabled={creating}
                    className={styles.input}
                  />
                </div>

                {/* Export Type */}
                <div className={styles.field}>
                  <label className={styles.label}>Export Type</label>

                  <div className={styles.typeGrid}>
                    {EXPORT_TYPES.map((option) => {
                      const selected = form.type === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={creating}
                          onClick={() =>
                            updateForm({
                              type: option.value,
                            })
                          }
                          className={`${styles.option} ${
                            selected ? styles.optionSelected : ""
                          }`}
                        >
                          <div className={styles.optionTitle}>
                            {option.label}
                          </div>

                          <div className={styles.optionDescription}>
                            {option.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Format */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="export-format">
                    Format
                  </label>

                  <select
                    id="export-format"
                    value={form.format}
                    onChange={(event) =>
                      updateForm({
                        format: event.target.value as ExportFormat,
                      })
                    }
                    disabled={creating}
                    className={styles.select}
                  >
                    {EXPORT_FORMATS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} — {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className={styles.field}>
                  <label className={styles.label}>Date Range</label>

                  <div className={styles.dateGrid}>
                    <div>
                      <label htmlFor="start-date" className={styles.smallLabel}>
                        Start Date
                      </label>

                      <input
                        id="start-date"
                        type="date"
                        value={form.startDate}
                        onChange={(event) =>
                          updateForm({
                            startDate: event.target.value,
                          })
                        }
                        disabled={creating}
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label htmlFor="end-date" className={styles.smallLabel}>
                        End Date
                      </label>

                      <input
                        id="end-date"
                        type="date"
                        value={form.endDate}
                        onChange={(event) =>
                          updateForm({
                            endDate: event.target.value,
                          })
                        }
                        disabled={creating}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                {/* Request Preview */}
                <div className={styles.preview}>
                  <div className={styles.previewTitle}>Request Preview</div>

                  <code className={styles.previewCode}>
                    {JSON.stringify(
                      {
                        name: form.name.trim(),
                        type: form.type,
                        format: form.format,
                        filters: {},
                        startDate: form.startDate || undefined,
                        endDate: form.endDate || undefined,
                      },
                      null,
                      2,
                    )}
                  </code>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => !creating && setShowCreate(false)}
                  disabled={creating}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className={styles.primaryButton}
                >
                  {creating ? (
                    <>
                      <Loader2 size={17} className={styles.spin} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Export
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
