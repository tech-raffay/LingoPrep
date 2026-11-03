import axios from "axios";
import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000, // Includes bounded provider work and persistence.
});

const attemptMemory = new Map<string, { fingerprint: string; key: string }>();
let guestId: string | undefined;

export function resetAttempt(skill: string) {
  for (const action of ["submit", "submit-full", "evaluate"]) {
    const path = `/api/${skill}/${action}`;
    attemptMemory.delete(path);
    try { sessionStorage.removeItem(`lingoprep-attempt:${path}`); } catch { /* Memory fallback. */ }
  }
}

async function attemptKey(path: string, payload: unknown): Promise<string> {
  // Persist only a hash and opaque key, never the learner's essay or answers.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  let previous = attemptMemory.get(path);
  try {
    const stored = sessionStorage.getItem(`lingoprep-attempt:${path}`);
    if (stored) previous = JSON.parse(stored);
  } catch { /* Private browsing may disable storage. */ }
  if (previous?.fingerprint === fingerprint) return previous.key;
  const attempt = { fingerprint, key: crypto.randomUUID() };
  attemptMemory.set(path, attempt);
  try { sessionStorage.setItem(`lingoprep-attempt:${path}`, JSON.stringify(attempt)); } catch { /* Memory fallback. */ }
  return attempt.key;
}

// Request interceptor — attach Supabase session token dynamically
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      if (!guestId) {
        try { guestId = sessionStorage.getItem("lingoprep-guest") || undefined; } catch { /* Memory fallback. */ }
        guestId ||= crypto.randomUUID();
        try { sessionStorage.setItem("lingoprep-guest", guestId); } catch { /* Memory fallback. */ }
      }
      config.headers["X-Guest-Id"] = guestId;
      const path = config.url || "";
      if (config.method === "post" && /^\/api\/(reading|listening|writing|speaking)\/(submit|submit-full|evaluate)$/.test(path)) {
        config.headers["Idempotency-Key"] ||= await attemptKey(path, config.data);
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.error("Error retrieving Supabase session token:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Handle session expiry or logout redirection if needed
        supabase.auth.signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
