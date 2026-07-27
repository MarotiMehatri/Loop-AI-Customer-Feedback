export interface ClassifyFeedbackInput {
  content: string;
  source?: string;
  customerName?: string;
}

export interface ClassifyBatchInput {
  items: ClassifyFeedbackInput[];
}

export interface ClassificationResult {
  sentiment: "POS" | "NEU" | "NEG";
  category: string;
  tags: string[];
  confidence: number;
  summary?: string;
}

export interface BatchClassificationResult {
  results: ClassificationResult[];
  processedCount: number;
  failedCount: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}
