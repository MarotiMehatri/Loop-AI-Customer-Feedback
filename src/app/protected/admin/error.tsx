"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Unable to load this page</h1>
      <p className="text-sm text-muted-foreground">Please try again.</p>
      <button
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}
