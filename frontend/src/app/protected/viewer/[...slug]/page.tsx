import { notFound, redirect } from "next/navigation";

export default async function LegacyViewerRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join(" ").toLowerCase();

  if (path === "ask loop ai" || path === "ask%20loop%20ai") {
    redirect("/protected/viewer/ask-loop");
  }

  if (path === "data sources" || path === "data%20sources") {
    redirect("/protected/viewer/data-sources");
  }

  notFound();
}
