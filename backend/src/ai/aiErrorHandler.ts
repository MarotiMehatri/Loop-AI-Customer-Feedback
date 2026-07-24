export type AIErrorCode =
  | "API_KEY_INVALID"
  | "RATE_LIMITED"
  | "MODEL_NOT_FOUND"
  | "INVALID_RESPONSE"
  | "EMPTY_RESPONSE"
  | "NETWORK_ERROR"
  | "UNKNOWN_AI_ERROR";

export class AIServiceError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly cause?: unknown,
  ) {
    super(message);

    this.name = "AIServiceError";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown AI error";
  }
}

export function handleAIError(error: unknown): AIServiceError {
  if (error instanceof AIServiceError) {
    return error;
  }

  const message = getErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("api_key_invalid") ||
    normalizedMessage.includes("api key not valid")
  ) {
    return new AIServiceError(
      "API_KEY_INVALID",
      "The Gemini API key is invalid.",
      401,
      error,
    );
  }

  if (
    normalizedMessage.includes("429") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("resource_exhausted")
  ) {
    return new AIServiceError(
      "RATE_LIMITED",
      "Gemini request limit exceeded. Please try again later.",
      429,
      error,
    );
  }

  if (
    normalizedMessage.includes("model not found") ||
    normalizedMessage.includes("not found for api version")
  ) {
    return new AIServiceError(
      "MODEL_NOT_FOUND",
      "The configured Gemini model is unavailable.",
      400,
      error,
    );
  }

  if (
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("network")
  ) {
    return new AIServiceError(
      "NETWORK_ERROR",
      "Could not connect to the Gemini API.",
      503,
      error,
    );
  }

  return new AIServiceError(
    "UNKNOWN_AI_ERROR",
    "Unable to complete the AI request.",
    500,
    error,
  );
}
