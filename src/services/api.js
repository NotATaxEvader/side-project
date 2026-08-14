const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
const TOKEN_KEY = "altitude_access_token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;
  const bodyIsFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (hasBody && !bodyIsFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: hasBody && !bodyIsFormData && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
    });
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_BASE_URL}.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");

  if (!response.ok) {
    if (response.status === 401) clearAccessToken();
    const message = payload?.message || payload?.error || payload || `Request failed (${response.status}).`;
    throw new Error(typeof message === "string" ? message : "The backend rejected the request.");
  }

  return payload;
}
