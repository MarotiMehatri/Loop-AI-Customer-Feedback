export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const data = (error as { response?: { data?: { message?: string; error?: string } } }).response?.data;
    if (data?.message === "Internal server error" && data.error) return data.error;
    if (typeof data?.message === "string") return data.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
