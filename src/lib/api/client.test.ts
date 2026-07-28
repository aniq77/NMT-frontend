import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./client";

// Build a minimal Response-like object for the mocked fetch.
function makeResponse(
  status: number,
  {
    json,
    text,
    contentLength,
  }: { json?: unknown; text?: string; contentLength?: string } = {},
): Response {
  const bodyText = text ?? (json !== undefined ? JSON.stringify(json) : "");
  const headers = new Map<string, string>();
  if (contentLength !== undefined) headers.set("content-length", contentLength);

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => headers.get(k.toLowerCase()) ?? null },
    json: async () => {
      if (json === undefined && !bodyText) throw new SyntaxError("no body");
      return json ?? JSON.parse(bodyText);
    },
    text: async () => bodyText,
  } as unknown as Response;
}

/**
 * Await a request that is expected to fail and hand back the `ApiError` it
 * rejected with.
 *
 * `request.catch((e) => e)` would widen the result to `unknown` — the requests
 * under test are deliberately untyped — and every `err.status` read after it
 * then fails to compile. Narrowing here keeps the assertions readable and
 * turns "it resolved after all" into a clear failure instead of a confusing
 * `toBeInstanceOf` mismatch.
 */
async function captureApiError(request: Promise<unknown>): Promise<ApiError> {
  try {
    await request;
  } catch (err) {
    if (err instanceof ApiError) return err;
    throw err;
  }
  throw new Error("Expected the request to reject with an ApiError, but it resolved.");
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("api client — happy path", () => {
  it("GET parses JSON body and returns typed data", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { json: { id: "u1" } }));

    const data = await api.get<{ id: string }>("/api/v1/users/me/");

    expect(data).toEqual({ id: "u1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/v1/users/me/");
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("include");
  });

  it("POST serializes the body and sets JSON content-type", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { json: { ok: true } }));

    await api.post("/api/v1/auth/login/", { email: "a@b.c" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.c" }));
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("returns undefined on 204 No Content", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(204));

    const data = await api.post<void>("/api/v1/auth/logout/");

    expect(data).toBeUndefined();
  });

  it("returns undefined when content-length is 0", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { contentLength: "0" }));

    const data = await api.get<void>("/api/v1/ping/");

    expect(data).toBeUndefined();
  });
});

describe("api client — error mapping", () => {
  it("throws ApiError carrying status and parsed field errors", async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(400, { json: { email: ["already taken"] } }),
    );

    const err = await captureApiError(api.post("/api/v1/auth/register/", {}));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.data).toEqual({ email: ["already taken"] });
  });

  it("falls back to empty data object when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(500, { text: "<html>oops" }));

    const err = await captureApiError(api.get("/api/v1/boom/"));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
    expect(err.data).toEqual({});
  });
});

describe("api client — 401 refresh & retry", () => {
  it("on 401 refreshes, then retries the original request once and returns data", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(401)) // original request
      .mockResolvedValueOnce(makeResponse(200)) // refresh ok
      .mockResolvedValueOnce(makeResponse(200, { json: { id: "u1" } })); // retry

    const data = await api.get<{ id: string }>("/api/v1/users/me/");

    expect(data).toEqual({ id: "u1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/api/v1/auth/token/refresh/");
  });

  it("does not retry more than once (second 401 throws)", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(401)) // original
      .mockResolvedValueOnce(makeResponse(200)) // refresh ok
      .mockResolvedValueOnce(makeResponse(401)); // retry still 401

    const err = await captureApiError(api.get("/api/v1/users/me/"));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws 'Session expired' when the refresh call fails", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(401)) // original
      .mockResolvedValueOnce(makeResponse(401)); // refresh fails

    const err = await captureApiError(api.get("/api/v1/users/me/"));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.data).toEqual({ detail: "Session expired" });
    expect(fetchMock).toHaveBeenCalledTimes(2); // no retry of original
  });

  it("never tries to refresh when the failing call IS the refresh endpoint", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(401));

    const err = await captureApiError(api.post("/api/v1/auth/token/refresh/"));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1); // no extra refresh attempt
  });
});
