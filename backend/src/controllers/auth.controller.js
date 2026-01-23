import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { getAuthUrl, handleCallback } from "../services/googleCalendar.js";

// Get user role
export const getMyRole = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("roles(name)")
            .eq("id", req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ role: user.roles?.name });
    } catch (error) {
        console.error("Get Role Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Initiate Google OAuth flow
export const initGoogleAuth = async (req, res) => {
    try {
        // 1. Get JWT from query param (since browser redirect can't send headers)
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: "No token provided" });
        }

        // 2. Verify token to get user ID
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const userId = data.user.id;

        // 3. Generate Auth URL with STATE = userId
        const url = getAuthUrl(userId);

        // 4. Redirect
        res.redirect(url);

    } catch (error) {
        console.error("Google Auth Init Error:", error);
        res.status(500).json({ error: "Failed to initialize Google Auth" });
    }
};

// Handle OAuth callback
export const googleAuthCallback = async (req, res) => {
    const { code, state } = req.query;
    // state = userId

    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        await handleCallback(code, state); // state is userId
        // Redirect back to frontend
        res.redirect("http://localhost:5173/faculty?calendar=connected");
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.redirect("http://localhost:5173/faculty?calendar=failed");
    }
};
