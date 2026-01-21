import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    res.json(data);
};


// import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const getMyRole = async (req, res) => {
    console.log("REQ.USER:", req.user);

    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("role_id")
        .eq("id", req.user.id)
        .single();

    if (error || !user) {
        return res.status(400).json({ error: "User not found" });
    }

    const { data: role, error: roleError } = await supabaseAdmin
        .from("roles")
        .select("name")
        .eq("id", user.role_id)
        .single();

    if (roleError || !role) {
        return res.status(400).json({ error: "Role not found" });
    }

    res.json({ role: role.name });
};
