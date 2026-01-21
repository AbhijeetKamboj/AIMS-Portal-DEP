import { supabase } from "./supabaseClient.js";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = async (url, method = "GET", body) => {
    // prefer supabase session getter, but fall back to localStorage for legacy sessions
    let session = null;
    try {
        const { data } = await supabase.auth.getSession();
        session = data?.session || JSON.parse(localStorage.getItem("session"));
    } catch {
        // if getSession fails (older client), fall back
        session = JSON.parse(localStorage.getItem("session"));
    }

    try {
        const res = await fetch(`${API_BASE}${url}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`
            },
            body: body ? JSON.stringify(body) : undefined
        });

        let json = null;
        try {
            json = await res.json();
        } catch {
            // ignore parse errors
        }

        if (!res.ok) {
            // Return error object instead of throwing, for consistent handling
            return { error: json?.error || json?.message || res.statusText || "Request failed" };
        }

        return json;
    } catch (err) {
        // Network errors or other issues
        console.error("API Fetch Error:", err);
        return { error: err.message || "Network error" };
    }
};

export const getMyRole = async () => {
    return apiFetch("/auth/me/role");
};
