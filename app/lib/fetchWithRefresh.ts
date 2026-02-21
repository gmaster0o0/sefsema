export async function fetchWithRefresh(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const baseInit: RequestInit = {
    credentials: "include",
    ...init,
  };

  // First attempt
  let res = await fetch(input, baseInit);

  // If unauthorized, try to refresh session and retry once
  if (res.status === 401) {
    try {
      const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      if (!refresh.ok) {
        return res;
      }
      // Retry original request once after successful refresh
      res = await fetch(input, baseInit);
    } catch (err) {
      return res;
    }
  }

  return res;
}

export async function fetchJsonWithRefresh<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetchWithRefresh(input, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

/*
Usage example (client-side):
import { fetchJsonWithRefresh } from "../lib/fetchWithRefresh";

async function load() {
  const data = await fetchJsonWithRefresh('/api/some/protected', { method: 'GET' });
}

This helper automatically includes credentials (cookies), calls /api/auth/refresh on 401,
and retries the original request once when refresh succeeds.
*/
