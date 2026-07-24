import { countGeminiTokens } from "./gemini.client.js";

export async function countTokens(content: string): Promise<number> {
  if (!content.trim()) {
    return 0;
  }

  return countGeminiTokens(content);
}

export function estimateTokens(content: string): number {
  if (!content.trim()) {
    return 0;
  }

  // Approximate fallback only.
  return Math.ceil(content.length / 4);
}

export function truncateByCharacters(
  content: string,
  maximumCharacters: number,
): string {
  if (content.length <= maximumCharacters) {
    return content;
  }

  return `${content.slice(0, maximumCharacters)}\n...[content truncated]`;
}
