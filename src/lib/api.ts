/** Central API client. Endpoint paths are relative to NEXT_PUBLIC_API_URL. */
const DEFAULT_API_BASE = "https://rentnest-backend-1.onrender.com/api";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status = 0, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown; token?: string | null };

function readMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const value = payload as { message?: unknown; error?: unknown };
    if (typeof value.message === "string" && value.message.trim()) return value.message;
    if (typeof value.error === "string" && value.error.trim()) return value.error;
  }
  const messages: Record<number, string> = {
    400: "Please check the information and try again.",
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested information could not be found.",
    409: "This action conflicts with the current record. Refresh and try again.",
    422: "Some information is invalid. Please review the form.",
    429: "Too many requests. Please wait a moment and try again.",
  };
  if (status >= 500) return "The server is having trouble. Please try again shortly.";
  return messages[status] || `Request failed (${status}). Please try again.`;
}


export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, token, headers, signal: externalSignal, ...rest } = options;
  const url = `${API_BASE}/${path.startsWith("/") ? path.slice(1) : path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  // Keep support for cancellation from the caller.
  const forwardAbort = () => controller.abort();
  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener("abort", forwardAbort, { once: true });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(body === undefined || body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    if (controller.signal.aborted) {
      if (externalSignal?.aborted) {
        throw new ApiError("The request was cancelled. Please try again.");
      }

      throw new ApiError(
        "The server took too long to respond. Please try again.",
        408,
        error
      );
    }

    throw new ApiError(
      "Could not connect to the server. Check your internet connection and try again.",
      0,
      error
    );
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }

  const contentType = response.headers.get("content-type") || "";
  let payload: unknown;

  try {
    if (contentType.includes("application/json")) {
      const text = await response.text();
      payload = text ? JSON.parse(text) : null;
    } else {
      payload = await response.text();
    }
  } catch {
    payload = null;

    if (response.ok) {
      throw new ApiError(
        "The server returned an invalid response. Please try again.",
        response.status
      );
    }
  }

  if (!response.ok) {
    throw new ApiError(
      readMessage(payload, response.status),
      response.status,
      payload
    );
  }

  return payload as T;
}

export const endpoints = {
  properties: "/properties",
  categories: "/categories",
  register: "/auth/register",
  login: "/auth/login",
  rentals: "/rentals",
  payments: "/payments",
  createPayment: "/payments/create",
  landlordProperties: "/properties",
  landlordRequests: "/rentals/landlord/requests",
  adminUsers: "/admin/users",
} as const;

export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.name === "AbortError") return "The request was cancelled. Please try again.";
  if (error instanceof Error && /failed to fetch|networkerror|load failed/i.test(error.message)) {
    return "Could not connect to the server. Check your internet connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
