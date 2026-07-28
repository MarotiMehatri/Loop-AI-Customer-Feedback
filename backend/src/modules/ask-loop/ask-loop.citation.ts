import type { AskLoopCitation } from "./ask-loop.types.js";

export function createCitations(
  feedbackItems: Array<{
    id: string;
    content: string;
    sentiment: string | null;
    source: string;
  }>,
): AskLoopCitation[] {
  return feedbackItems.map((item) => ({
    feedbackId: item.id,
    content: item.content.length > 200
      ? `${item.content.slice(0, 200)}...`
      : item.content,
    sentiment: item.sentiment ?? "NEUTRAL",
    source: item.source,
    relevance: 1,
  }));
}

export function rankCitationsByRelevance(
  citations: AskLoopCitation[],
  query: string,
): AskLoopCitation[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return citations
    .map((citation) => {
      const content = citation.content.toLowerCase();
      const matches = queryTerms.filter((term) => content.includes(term)).length;
      const relevance = queryTerms.length > 0 ? matches / queryTerms.length : 0;

      return { ...citation, relevance: Number(relevance.toFixed(2)) };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

export function formatCitationsForPrompt(citations: AskLoopCitation[]): string {
  if (citations.length === 0) return "";

  return citations
    .map(
      (c, i) =>
        `[${i + 1}] Feedback #${c.feedbackId.slice(0, 8)} (${c.sentiment}, ${c.source}): "${c.content}"`,
    )
    .join("\n");
}
