import { supabaseAdmin } from "../config/supabaseAdmin.js";

// Admin: Create a new course definition (Catalog)
export const createCourse = async (req, res) => {
    const { course_code, course_name, credits, department, l, t, p, s } = req.body;

    const { error } = await supabaseAdmin.from("courses").insert({
        course_code,
        course_name,
        credits, // Total credits
        department,
        l, t, p, s
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Course created successfully" });
};

// Public/Faculty: Get all courses (Catalog)
export const getCourses = async (req, res) => {
    const { data, error } = await supabaseAdmin.from("courses").select("*").order("course_code");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Public: Get all semesters
export const getSemesters = async (req, res) => {
    const { data, error } = await supabaseAdmin.from("semesters").select("*").order("start_date", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Faculty: Offer a course for a semester
export const offerCourse = async (req, res) => {
    const { course_id, semester_id, offering_dept_id, allowed_dept_ids } = req.body;

    const { error } = await supabaseAdmin.from("course_offerings").insert({
        course_id,
        semester_id,
        faculty_id: req.user.id,
        status: 'pending', // Default pending approval
        offering_dept_id,
        allowed_dept_ids // Array of IDs
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
            students (user_id, roll_number, user:users(name))
        `)
        .eq("offering_id", offering_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

