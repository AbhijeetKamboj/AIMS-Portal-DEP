import { supabase } from "../supabaseClient.js";

export default async function authMiddleware(req, res, next) {
  // Allow preflight
  console.log("AUTH MID CALLED:", req.method, req.originalUrl);

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, name")
    .eq("id", authData.user.id)
    .single();

  if (profileError) return res.status(500).json({ error: "Profile not found" });

  req.user = { id: profile.id, role: profile.role, name: profile.name, email: authData.user.email };
  return next();
}
