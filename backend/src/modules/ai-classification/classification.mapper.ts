import type { ClassificationRecord, ClassificationResult } from "./classification.types.js";

export function mapClassificationResult(
  result: ClassificationResult,
  _feedbackId?: string,
): {
  sentiment: string;
  category: string;
  tags: string[];
  confidence: number;
  summary: string | null;
  method: string;
} {
  return {
    sentiment: result.sentiment === "POS" ? "POSITIVE" : result.sentiment === "NEG" ? "NEGATIVE" : "NEUTRAL",
    category: result.category,
    tags: result.tags,
    confidence: result.confidence,
    summary: result.summary ?? null,
    method: result.method ?? "keyword",
  };
}

export function mapClassificationRecord(
  record: ClassificationRecord,
): ClassificationResult {
  return {
    sentiment: record.sentiment as ClassificationResult["sentiment"],
    category: record.category,
    tags: record.tags,
    confidence: record.confidence,
    summary: record.summary ?? undefined,
    method: record.method as ClassificationResult["method"],
  };
}

export function mapClassificationRecords(
  records: ClassificationRecord[],
): ClassificationResult[] {
  return records.map(mapClassificationRecord);
}
