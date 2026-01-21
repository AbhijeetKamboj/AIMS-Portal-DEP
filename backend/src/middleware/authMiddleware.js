import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";


export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = data.user;
  next();
};
