import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const lockSemester = async (req, res) => {
    const { semester_id } = req.body;

    await supabaseAdmin
        .from("semesters")
        .update({ grade_locked: true })
        .eq("id", semester_id);

    res.json({ message: "Semester grades locked" });
};

export const assignRole = async (req, res) => {
    const { user_id, role_id, name, email } = req.body;

    const { error } = await supabaseAdmin
        .from("users")
        .insert({
            id: user_id,
            name,
            email,
            role_id
        });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Role assigned" });
};

// Helper to create auth user
const createAuthUser = async (email, password, name, role_id) => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password || "Start123!",
        email_confirm: true,
        user_metadata: { name }
    });

    if (error) throw error;

    // Link to public.users table (triggers will handle this usually, but our schema might need manual insert if triggers aren't set up for new auth users to public users syncing. 
    // Based on schema, public.users is manual. Let's insert there.)

    try {
        const { error: dbError } = await supabaseAdmin.from("users").insert({
            id: data.user.id,
            name,
            email,
            role_id
        });
        if (dbError) throw dbError;
    } catch (err) {
        // rollback auth user if DB insert fails? strictly speaking yes, but for now simple throw
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        throw err;
    }

    return data.user;
};

export const createStudent = async (req, res) => {
    const { email, password, name, roll_number, department, batch } = req.body;

    try {
        const user = await createAuthUser(email, password, name, 1); // role_id 1 = student

        const { error } = await supabaseAdmin.from("students").insert({
            user_id: user.id,
            roll_number,
            department,
            batch
        });

        if (error) throw error;

        res.json({ message: "Student created successfully", userId: user.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const createFaculty = async (req, res) => {
    const { email, password, name, employee_id, department } = req.body;

    try {
        const user = await createAuthUser(email, password, name, 2); // role_id 2 = faculty

        const { error } = await supabaseAdmin.from("faculty").insert({
            user_id: user.id,
            employee_id,
            department
        });

        if (error) throw error;

        res.json({ message: "Faculty created successfully", userId: user.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Approve Pending Grades
export const approveGrades = async (req, res) => {
    const { grade_ids } = req.body; // Array of grade IDs to approve

    if (!grade_ids || !Array.isArray(grade_ids) || grade_ids.length === 0) {
        return res.status(400).json({ error: "grade_ids array required" });
    }

    const { error } = await supabaseAdmin
        .from("grades")
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .in("id", grade_ids);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Grades approved successfully" });
};

export const getPendingGrades = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("grades")
            .select(`
                id,
                student_id,
                offering_id,
                grade,
                submitted_at,
                status
            `)
            .eq("status", "pending");

        if (error) throw error;

        // Enrich with related data
        const enrichedData = await Promise.all((data || []).map(async (g) => {
            // Get student info
            const { data: student } = await supabaseAdmin
                .from("students")
                .select("roll_number, users(name)")
                .eq("user_id", g.student_id)
                .single();

            // Get offering info
            const { data: offering } = await supabaseAdmin
                .from("course_offerings")
                .select("courses(course_code, course_name), faculty(users(name)), semesters(name)")
                .eq("id", g.offering_id)
                .single();

            return {
                ...g,
                students: student,
                course_offerings: offering
            };
        }));

        res.json(enrichedData);
    } catch (error) {
        console.error("getPendingGrades Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// Deprecated: Old Admin CSV Upload (Removed as per request)
export const uploadGrades = async (req, res) => {
    return res.status(410).json({ error: "Admin grade upload is deprecated. Faculty must upload grades." });
};

export const assignAdvisor = async (req, res) => {
    const { student_roll, faculty_email } = req.body;

    // 1. Find Student
    const { data: student, error: sErr } = await supabaseAdmin
        .from("students")
        .select("user_id")
        .eq("roll_number", student_roll)
        .single();

    if (sErr || !student) return res.status(404).json({ error: "Student not found" });

    // 2. Find Faculty
    // Join with users because email is in users table, but filtering by role faculty is good practice or just assume email is unique
    const { data: facultyUser, error: fErr } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", faculty_email)
        .single();

    if (fErr || !facultyUser) return res.status(404).json({ error: "Faculty user not found" });

    // Verify Is Faculty?
    const { data: facultyProfile } = await supabaseAdmin
        .from("faculty")
        .select("user_id")
        .eq("user_id", facultyUser.id)
        .single();

    if (!facultyProfile) return res.status(400).json({ error: "User is not a faculty member" });

    // 3. Assign
    const { error } = await supabaseAdmin
        .from("faculty_advisors")
        .upsert({
            student_id: student.user_id,
            faculty_id: facultyUser.id
        });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Advisor assigned successfully" });
};

// Bulk Create Users (Admin)
export const bulkCreateUsers = async (req, res) => {
    const { users } = req.body; // Array of { email, password, name, role_id, ...additional_info }

    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ error: "Users array is required" });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const user of users) {
        try {
            // Determine Role ID: 1=Student, 2=Faculty, 3=Admin, 4=Advisor?
            // User input should specify or we deduce.
            // Let's assume CSV provides everything.

            // Create Auth User
            const authUser = await createAuthUser(user.email, user.password || "Start123!", user.name, user.role_id);

            // Insert into specific role table
            if (user.role_id == 1) { // Student
                const { error } = await supabaseAdmin.from("students").insert({
                    user_id: authUser.id,
                    roll_number: user.roll_number,
                    department: user.department,
                    batch: user.batch
                });
                if (error) throw error;

            } else if (user.role_id == 2) { // Faculty
                const { error } = await supabaseAdmin.from("faculty").insert({
                    user_id: authUser.id,
                    employee_id: user.employee_id,
                    department: user.department
                });
                if (error) throw error;
            }

            results.success++;
        } catch (err) {
            console.error(`Failed to create user ${user.email}:`, err);
            results.failed++;
            results.errors.push({ email: user.email, error: err.message });
        }
    }

    res.json({ message: "Bulk creation completed", results });
};

// Bulk Assign Advisors
export const bulkAssignAdvisors = async (req, res) => {
    const { assignments } = req.body; // Array of { student_roll, faculty_email }

    if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({ error: "Assignments array is required" });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const item of assignments) {
        try {
            // Reuse logic? Or optimized batch? Loop for now.
            // 1. Find Student
            const { data: student, error: sErr } = await supabaseAdmin
                .from("students")
                .select("user_id")
                .eq("roll_number", item.student_roll)
                .single();

            if (sErr || !student) throw new Error(`Student ${item.student_roll} not found`);

            // 2. Find Faculty
            const { data: facultyUser, error: fErr } = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("email", item.faculty_email)
                .single();

            if (fErr || !facultyUser) throw new Error(`Faculty ${item.faculty_email} not found`);

            // 3. Upsert Assignment
            const { error } = await supabaseAdmin
                .from("faculty_advisors")
                .upsert({
                    student_id: student.user_id,
                    faculty_id: facultyUser.id
                });

            if (error) throw error;

            results.success++;
        } catch (err) {
            results.failed++;
            results.errors.push({ ...item, error: err.message });
        }
    }

    res.json({ message: "Bulk assignment completed", results });
};

export const adminSubmitGrade = async (req, res) => {
    const { student_id, offering_id, grade } = req.body;

    if (!student_id || !offering_id || !grade) {
        return res.status(400).json({ error: "student_id, offering_id, and grade are required" });
    }

    // Try to update first, then insert if not exists
    const { data: existing } = await supabaseAdmin
        .from("grades")
        .select("student_id")
        .eq("student_id", student_id)
        .eq("offering_id", offering_id)
        .single();

    let error;
    if (existing) {
        // Update existing grade
        const result = await supabaseAdmin
            .from("grades")
            .update({ grade, attempt: 1 })
            .eq("student_id", student_id)
            .eq("offering_id", offering_id);
        error = result.error;
    } else {
        // Insert new grade
        const result = await supabaseAdmin
            .from("grades")
            .insert({
                student_id,
                offering_id,
                grade,
                attempt: 1
            });
        error = result.error;
    }

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Grade submitted successfully" });
};
