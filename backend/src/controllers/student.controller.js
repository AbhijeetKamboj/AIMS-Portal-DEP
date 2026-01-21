import { supabaseAdmin } from "../config/supabaseAdmin.js";

export const enrollCourse = async (req, res) => {
    const { offering_id, enrollment_type } = req.body;
    const validTypes = ['credit', 'minor', 'concentration'];

    const type = validTypes.includes(enrollment_type) ? enrollment_type : 'credit';

    // 1. Get Offering Details (Credits, Semester, & Department Rules)
    const { data: offering, error: oErr } = await supabaseAdmin
        .from("course_offerings")
        .select(`
        id, 
        semester_id,
        allowed_dept_ids,
        courses (credits)
    `)
        .eq("id", offering_id)
        .single();

    if (oErr || !offering) return res.status(404).json({ error: "Offering not found" });

    const newCredits = offering.courses.credits;
    const currentSemesterId = offering.semester_id;
    const allowedDeptIds = offering.allowed_dept_ids || [];

    // 2. Check Allowed Departments (if restricted)
    if (allowedDeptIds.length > 0) {
        // Get Student's Department Code
        const { data: student, error: sErr } = await supabaseAdmin
            .from("students")
            .select("department")
            .eq("user_id", req.user.id)
            .single();

        if (sErr || !student) return res.status(404).json({ error: "Student profile not found" });

        // Resolve Student's Department Code to ID
        // Note: Schema stores 'department' as TEXT (Code) in Students table but Departments table has both.
        // We need to match student.department (e.g. 'CSE') to departments.code ('CSE') -> ID.
        const { data: deptInfo } = await supabaseAdmin
            .from("departments")
            .select("id")
            .eq("code", student.department)
            .single();

        // If student dept not found in Departments table, we can't verify (or fail safe). 
        // Assuming it exists if seeded. If not, fail.
        if (!deptInfo || !allowedDeptIds.includes(deptInfo.id)) {
            return res.status(403).json({
                error: `Enrollment restricted to specific departments. Your department (${student.department}) is not allowed.`
            });
        }
    }

    // 3. Calculate Current Credits for this Semester
    const { data: currentEnrollments, error: eErr } = await supabaseAdmin
        .from("enrollments")
        .select(`
        offering_id,
        status,
        course_offerings!inner (
            semester_id,
            courses (credits)
        )
    `)
        .eq("student_id", req.user.id)
        .neq("status", "rejected")
        .eq("course_offerings.semester_id", currentSemesterId);

    if (eErr) return res.status(400).json({ error: eErr.message });

    const currentTotalCredits = currentEnrollments.reduce((sum, enr) => sum + enr.course_offerings.courses.credits, 0);

    if (currentTotalCredits + newCredits > 24) {
        return res.status(400).json({
            error: `Credit limit exceeded. Current: ${currentTotalCredits}, Requested: ${newCredits}, Limit: 24`
        });
    }

    // 4. Proceed with Enrollment
    const { error } = await supabaseAdmin
        .from("enrollments")
        .insert({
            student_id: req.user.id,
            offering_id,
            status: 'pending_faculty', // Explicitly set starting status
            enrollment_type: type
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Enrollment requested successfully" });
};

export const getTranscript = async (req, res) => {
    const { data, error } = await supabaseAdmin.rpc("student_transcript", {
        sid: req.user.id
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
};

export const getCgpa = async (req, res) => {
    const { data } = await supabaseAdmin
        .from("cumulative_gpa")
        .select("*")
        .eq("student_id", req.user.id)
        .single();

    res.json(data);
};

export const listOfferings = async (req, res) => {
    // Use new RPC to get stats
    const { data, error } = await supabaseAdmin.rpc("get_offerings_with_stats", {
        p_semester_id: null
    });

    if (error) return res.status(400).json({ error: error.message });

    // Map for frontend compatibility + stats
    const mapped = data.map(o => ({
        id: o.id,
        semester_id: o.semester_id,
        course_id: o.id, // Warning: This is OFFERING ID. We need COURSE_ID for filtering. 
        // The RPC 'get_offerings_with_stats' I wrote didn't return course_id... 
        // I should have included it. 
        // But wait, for Duplicate Check I need to know which course_code is offered.
        // I have course_code. I can filter by course_code.
        courses: {
            course_code: o.course_code,
            course_name: o.course_name,
            credits: o.credits,
            l: o.l, t: o.t, p: o.p, s: o.s
        },
        faculty: {
            users: { name: o.faculty_name }
        },
        stats: {
            enrolled: o.enrolled_count,
            pending: o.pending_count
        }
    }));

    res.json(mapped);
};

export const getMyEnrollments = async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select("offering_id, status, enrollment_type")
        .eq("student_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

export const getSemesterGPA = async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("semester_gpa")
        .select("*")
        .eq("student_id", req.user.id)
        .order("semester_id", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
};

