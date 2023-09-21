import type { AppType } from "api";
import { hc } from "hono/client";
export type { InferRequestType, InferResponseType } from "hono/client";
import useSWR from "swr";
import { env } from "./env";

export const api = hc<AppType>(env.PUBLIC_API_URL, {
  headers: {
    "x-client-id": "web",
  },
  fetch(request: Request | URL | string, init?: RequestInit) {
    return fetch(request, { ...init, credentials: "include" });
  },
});

export type ApiClient = typeof api;

export function useSession({ suspense = false }: { suspense?: boolean } = {}) {
  return useSWR(
    "session",
    async () => {
      const res = await api.sessions.$get();

      if (!res.ok && res.status === 401) {
        return null;
      } else if (!res.ok) {
        throw new Error("Unexpected error");
      }

      return res.json();
    },
    { suspense },
  );
}
