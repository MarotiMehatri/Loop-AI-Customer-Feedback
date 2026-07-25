import { THEME_COLOR_PALETTE } from "./theme.constants.js";

import {
  clampNumber,
  normalizeThemeLookupName,
  normalizeThemeName,
  selectThemeColor,
  toTitleCase,
  uniqueStrings,
} from "./theme.helper.js";

import type {
  ThemeAiCandidate,
  ThemeAiFeedback,
  ThemeAiProvider,
  ThemeAiProviderInput,
} from "./theme.types.js";

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "being",
  "but",
  "can",
  "could",
  "customer",
  "does",
  "feedback",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "into",
  "its",
  "just",
  "more",
  "not",
  "our",
  "out",
  "please",
  "should",
  "some",
  "than",
  "that",
  "the",
  "their",
  "there",
  "they",
  "this",
  "too",
  "use",
  "very",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "you",
  "your",
]);

let registeredProvider: ThemeAiProvider | null = null;

export function registerThemeAiProvider(provider: ThemeAiProvider): void {
  registeredProvider = provider;
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 4 && !STOP_WORDS.has(token) && !/^\d+$/.test(token),
    );
}

function sanitizeCandidate(
  candidate: ThemeAiCandidate,
  index: number,
): ThemeAiCandidate | null {
  const name = normalizeThemeName(candidate.name);

  if (!name) {
    return null;
  }

  const description =
    candidate.description?.replace(/\s+/g, " ").trim() ||
    `Customer feedback related to ${name.toLowerCase()}.`;

  const color = /^#[0-9A-F]{6}$/i.test(candidate.color)
    ? candidate.color.toUpperCase()
    : selectThemeColor(index);

  return {
    name,
    description,
    color,
    confidence: clampNumber(Number(candidate.confidence) || 0.7, 0, 1),
    feedbackIds: uniqueStrings(candidate.feedbackIds),
  };
}

function fallbackThemeDiscovery(
  input: ThemeAiProviderInput,
): ThemeAiCandidate[] {
  const tokenFeedbackMap = new Map<string, Set<string>>();

  for (const feedback of input.feedback) {
    const tokens = new Set(tokenize(feedback.content));

    for (const token of tokens) {
      const ids = tokenFeedbackMap.get(token) ?? new Set<string>();

      ids.add(feedback.id);
      tokenFeedbackMap.set(token, ids);
    }
  }

  const existingNames = new Set(
    input.existingThemeNames.map(normalizeThemeLookupName),
  );

  return [...tokenFeedbackMap.entries()]
    .filter(
      ([token, ids]) =>
        ids.size >= input.minClusterSize &&
        !existingNames.has(normalizeThemeLookupName(token)),
    )
    .sort(([, firstIds], [, secondIds]) => secondIds.size - firstIds.size)
    .slice(0, input.maxThemes)
    .map(([token, ids], index) => {
      const name = toTitleCase(token);

      return {
        name,
        description: `Customer feedback frequently mentioning ${token}.`,
        color:
          THEME_COLOR_PALETTE[index % THEME_COLOR_PALETTE.length] ?? "#7C3AED",
        confidence: clampNumber(
          0.55 + ids.size / Math.max(input.feedback.length, 1),
          0.55,
          0.95,
        ),
        feedbackIds: [...ids],
      };
    });
}

export async function generateThemeCandidates(
  input: ThemeAiProviderInput,
): Promise<ThemeAiCandidate[]> {
  const rawCandidates = registeredProvider
    ? await registeredProvider(input)
    : fallbackThemeDiscovery(input);

  const existingNames = new Set(
    input.existingThemeNames.map(normalizeThemeLookupName),
  );

  const usedNames = new Set<string>();

  return rawCandidates
    .map(sanitizeCandidate)
    .filter((candidate): candidate is ThemeAiCandidate => candidate !== null)
    .filter((candidate) => {
      const normalizedName = normalizeThemeLookupName(candidate.name);

      if (existingNames.has(normalizedName) || usedNames.has(normalizedName)) {
        return false;
      }

      usedNames.add(normalizedName);
      return candidate.feedbackIds.length >= input.minClusterSize;
    })
    .slice(0, input.maxThemes);
}

export function buildThemeAiFeedback(
  feedback: Array<{
    id: string;
    content: string;
  }>,
): ThemeAiFeedback[] {
  return feedback.map((item) => ({
    id: item.id,
    content: item.content,
  }));
}
