import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you requested does not exist.</p>
      <Link className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href="/">
        Go home
      </Link>
    </main>
  );
}
