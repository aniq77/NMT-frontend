const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  _isRetry?: boolean;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: ApiFieldErrors,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

type ApiFieldErrors = Record<string, string | string[]>;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, _isRetry, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !_isRetry && !path.includes("/token/refresh/")) {
    const refreshed = await fetch(`${BASE_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      return request<T>(path, { ...options, _isRetry: true });
    }

    throw new ApiError(401, { detail: "Session expired" });
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data);
  }

  const contentLength = response.headers.get("content-length");
  if (response.status === 204 || contentLength === "0") {
    return undefined as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
