import type { ClassificationResult, ClassificationSentiment } from "./classification.types.js";
import { CLASSIFICATION_CATEGORIES } from "./classification.constants.js";

const POSITIVE_WORDS = [
  "great", "excellent", "amazing", "love", "fantastic",
  "wonderful", "perfect", "best", "happy", "satisfied",
  "thank", "awesome", "outstanding", "superb", "brilliant",
];

const NEGATIVE_WORDS = [
  "terrible", "awful", "hate", "worst", "horrible",
  "bad", "poor", "disappointed", "frustrated", "broken",
  "useless", "annoying", "waste", "fail", "problem",
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Bug Report": ["bug", "error", "crash", "broken", "fix", "issue", "fail", "glitch"],
  "Feature Request": ["feature", "request", "add", "wish", "need", "want", "should", "suggest"],
  "Performance": ["slow", "fast", "speed", "performance", "lag", "loading", "delay"],
  "Pricing": ["price", "cost", "expensive", "cheap", "plan", "subscription", "billing", "pay"],
  "User Experience": ["ui", "ux", "design", "interface", "easy", "difficult", "confusing", "navigation"],
  "Customer Support": ["support", "help", "response", "service", "agent", "ticket", "chat"],
};

export function classifyByKeywords(content: string): ClassificationResult {
  const normalized = content.trim().toLowerCase();

  const posCount = POSITIVE_WORDS.filter((w) => normalized.includes(w)).length;
  const negCount = NEGATIVE_WORDS.filter((w) => normalized.includes(w)).length;

  let sentiment: ClassificationSentiment = "NEU";
  let confidence = CLASSIFICATION_DEFAULT_CONFIDENCE;

  if (posCount > negCount) {
    sentiment = "POS";
    confidence = Math.min(0.95, 0.6 + posCount * 0.1);
  } else if (negCount > posCount) {
    sentiment = "NEG";
    confidence = Math.min(0.95, 0.6 + negCount * 0.1);
  }

  let category = "General";
  let maxMatches = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((k) => normalized.includes(k)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      category = cat;
    }
  }

  const tagSet = new Set<string>();

  if (sentiment === "POS") tagSet.add("positive");
  if (sentiment === "NEG") tagSet.add("negative");
  if (maxMatches > 0) tagSet.add(category.toLowerCase().replace(/\s+/g, "-"));
  if (content.length > 500) tagSet.add("detailed");

  return {
    sentiment,
    category,
    tags: Array.from(tagSet),
    confidence: Math.round(confidence * 100) / 100,
    method: "keyword",
  };
}

export function classifyBatchByKeywords(
  items: Array<{ content: string }>,
): ClassificationResult[] {
  return items.map((item) => classifyByKeywords(item.content));
}

export function mergeClassificationResults(
  aiResult: ClassificationResult | null,
  keywordResult: ClassificationResult,
): ClassificationResult {
  if (!aiResult) return keywordResult;

  const confidence = Math.max(aiResult.confidence, keywordResult.confidence);
  const method = aiResult.confidence >= keywordResult.confidence ? "ai" : "keyword";
  const sentiment = aiResult.confidence >= keywordResult.confidence
    ? aiResult.sentiment
    : keywordResult.sentiment;

  const tags = new Set([...aiResult.tags, ...keywordResult.tags]);

  return {
    sentiment,
    category: aiResult.category !== "General" ? aiResult.category : keywordResult.category,
    tags: Array.from(tags),
    confidence,
    summary: aiResult.summary ?? keywordResult.summary,
    method,
  };
}

export function validateContent(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return "Content is required";
  }

  if (content.length > 10000) {
    return "Content cannot exceed 10000 characters";
  }

  return null;
}

export function isValidCategory(category: string): boolean {
  return CLASSIFICATION_CATEGORIES.includes(category as typeof CLASSIFICATION_CATEGORIES[number])
    || category === "General";
}
