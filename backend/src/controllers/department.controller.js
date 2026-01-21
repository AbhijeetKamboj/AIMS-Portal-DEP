import { supabaseAdmin } from "../config/supabaseAdmin.js";

// Admin: Create Department
export const createDepartment = async (req, res) => {
    const { name, code } = req.body;

    const { error } = await supabaseAdmin.from("departments").insert({ name, code });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Department created" });
};

// Public: List Departments
export const listDepartments = async (req, res) => {
    const { data, error } = await supabaseAdmin.from("departments").select("*").order("name");

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};
