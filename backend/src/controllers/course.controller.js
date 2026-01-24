import { supabaseAdmin } from "../config/supabaseAdmin.js";

// Public/Faculty: Create a new course definition (Catalog)
// Assuming Middleware checks for Faculty/Admin role
export const createCourse = async (req, res) => {
    const { course_code, course_name, credits, department, l, t, p, s } = req.body;

    // Check if user is admin for auto-approval
    // We already authenticated, let's check role
    const { data: user } = await supabaseAdmin
        .from("users")
        .select("role_id")
        .eq("id", req.user.id)
        .single();

    // Role ID 3 is Admin (from seed)
    const isAdmin = user?.role_id === 3;
    const status = isAdmin ? 'approved' : 'pending';

    const { error } = await supabaseAdmin.from("courses").insert({
        course_code,
        course_name,
        credits, // Total credits
        department,
        l, t, p, s,
        status: status
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: isAdmin ? "Course created and approved successfully" : "Course created successfully (Pending Approval)" });
};

// Public/Faculty: Get all courses (Catalog) with filtering
export const getCourses = async (req, res) => {
    const { status } = req.query; // 'pending' or 'approved' or 'all'

    let query = supabaseAdmin.from("courses").select("*").order("course_code");

    // Default to approved if not specified, unless explicit 'all'
    if (status && status !== 'all') {
        query = query.eq("status", status);
    } else if (!status) {
        // Should we default to all? Or approved? 
        // For offering dropdowns, we likely want ONLY approved.
        // Let's assume approved by default if public/faculty accessing.
        // But admins might want all.
        // For now, let's return all but frontend filters. Or pass ?status=approved
        // Actually, let's keep it retrieving ALL for now to avoid breaking existing catalog views, 
        // but frontend should filter.
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Admin: Approve Course Catalog Entry
export const approveCourseCatalog = async (req, res) => {
    const { course_id, status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const { error } = await supabaseAdmin
        .from("courses")
        .update({ status })
        .eq("id", course_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: `Course ${status}` });
};

// Public: Get all semesters
export const getSemesters = async (req, res) => {
    const { data, error } = await supabaseAdmin.from("semesters").select("*").order("start_date", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Faculty: Offer a course for a semester
export const offerCourse = async (req, res) => {
    const { course_id, semester_id, offering_dept_id, allowed_dept_ids, slot } = req.body;

    const { error } = await supabaseAdmin.from("course_offerings").insert({
        course_id,
        semester_id,
        faculty_id: req.user.id,
        status: 'pending', // Default pending approval
        offering_dept_id,
        allowed_dept_ids, // Array of IDs
        slot // New Slot field
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Course offering created (pending approval)" });
};

// Admin: Approve/Reject a course offering
export const approveOffering = async (req, res) => {
    const { offering_id, status } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const { error } = await supabaseAdmin
        .from("course_offerings")
        .update({ status })
        .eq("id", offering_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: `Offering ${status}` });
};

// Public/Student: Get approved offerings
export const getApprovedOfferings = async (req, res) => {
    const { semester_id } = req.query;

    let query = supabaseAdmin
        .from("course_offerings")
        .select(`
      id,
      status,
      offering_dept_id,
      allowed_dept_ids,
      courses (course_code, course_name, credits, l, t, p, s),
      faculty (users (name)),
      semester_id,
      departments:offering_dept_id (code)
    `)
        .eq("status", "approved");

    if (semester_id) {
        query = query.eq("semester_id", semester_id);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Admin: Get all offerings (including pending)
export const getAllOfferings = async (req, res) => {
    const { semester_id } = req.query;

    let query = supabaseAdmin
        .from("course_offerings")
        .select(`
        id,
        status,
        offering_dept_id,
        allowed_dept_ids,
        courses (course_code, course_name, credits, l, t, p, s),
        faculty (users (name)),
        semester_id,
        departments:offering_dept_id (code)
      `);

    if (semester_id) {
        query = query.eq("semester_id", semester_id);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};


// Public: Get all offered course IDs for a semester (Pending + Approved) for filtering
export const getOfferedCourses = async (req, res) => {
    const { semester_id } = req.query;
    if (!semester_id) return res.status(400).json({ error: "Semester ID required" });

    const { data, error } = await supabaseAdmin
        .from("course_offerings")
        .select("course_id")
        .eq("semester_id", semester_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data.map(o => o.course_id));
};

// Public: Get detailed enrollments for an offering
export const getCourseEnrollments = async (req, res) => {
    const { offering_id } = req.query;
    if (!offering_id) return res.status(400).json({ error: "Offering ID required" });

    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select(`
            status,
            enrollment_type,
            students (user_id, roll_number, user:users(name, email))
        `)
        .eq("offering_id", offering_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Public: Get individual course by ID
export const getCourseById = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Course ID required" });

    const { data, error } = await supabaseAdmin
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Course not found" });
    res.json(data);
};

