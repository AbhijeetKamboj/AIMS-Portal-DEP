import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const requireRole = (roleName) => {
    return async (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("role_id")
            .eq("id", req.user.id)
            .single();

        if (userError || !user) {
            return res.status(400).json({ error: "User not found in users table" });
        }

        // Step 2: get role name
        const { data: role, error: roleError } = await supabaseAdmin
            .from("roles")
            .select("name")
            .eq("id", user.role_id)
            .single();

        if (roleError || !role) {
            return res.status(400).json({ error: "Role not found" });
        }

        const allowedRoles = Array.isArray(roleName) ? roleName : [roleName];

        if (!allowedRoles.includes(role.name)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    };
};
