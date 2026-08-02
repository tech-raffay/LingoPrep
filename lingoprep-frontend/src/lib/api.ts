import axios from "axios";
import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s timeout for LLM calls
});

// Request interceptor — attach Supabase session token dynamically
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
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
