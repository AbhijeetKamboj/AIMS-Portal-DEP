
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

export const uploadGrades = async (req, res) => {
    const { grades } = req.body; // Expects [{ roll_number, course_code, semester_id, grade }]

    if (!grades || !Array.isArray(grades)) {
        return res.status(400).json({ error: "Invalid input format. Expected array of grades." });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const item of grades) {
        const { roll_number, course_code, semester_id, grade } = item;

        try {
            // 1. Get Student ID
            const { data: student, error: sErr } = await supabaseAdmin
                .from("students")
                .select("user_id")
                .eq("roll_number", roll_number)
                .single();

            if (sErr || !student) throw new Error(`Student ${roll_number} not found`);

            // 2. Get Course ID
            const { data: course, error: cErr } = await supabaseAdmin
                .from("courses")
                .select("id")
                .eq("course_code", course_code)
                .single();

            if (cErr || !course) throw new Error(`Course ${course_code} not found`);

            // 3. Get Offering ID (assuming semester_id provided is valid)
            // We need to find the offering for this course in this semester.
            // If multiple offerings exist (e.g. diff faculty), this logic might need refinement to pick one.
            // For now, assuming 1 offering per course per semester or picking the first one.

            const { data: offering, error: oErr } = await supabaseAdmin
                .from("course_offerings")
                .select("id")
                .eq("course_id", course.id)
                .eq("semester_id", semester_id)
                .limit(1)
                .single();

            if (oErr || !offering) throw new Error(`Offering for ${course_code} in sem ${semester_id} not found`);

            // 4. Upsert Grade
            const { error: gErr } = await supabaseAdmin
                .from("grades")
                .upsert({
                    student_id: student.user_id,
                    offering_id: offering.id,
                    grade
                }, { onConflict: 'student_id, offering_id' });

            if (gErr) throw gErr;

            results.success++;

        } catch (err) {
            results.failed++;
            results.errors.push({ item, error: err.message });
        }
    }

    res.json({ message: "Grade upload processed", results });
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

// Admin: Submit grade for a student
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

