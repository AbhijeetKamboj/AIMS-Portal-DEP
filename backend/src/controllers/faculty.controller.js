import { supabaseAdmin } from "../config/supabaseAdmin.js";

// Existing grade submission (might be deprecated if Admin only uploads, but keeping for now)
export const submitGrade = async (req, res) => {
    const { student_id, offering_id, grade, attempt } = req.body;

    const { error } = await supabaseAdmin
        .from("grades")
        .upsert({
            student_id,
            offering_id,
            grade,
            attempt
        });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Grade submitted" });
};

// Course Faculty: Approve enrollment (Step 1)
export const approveEnrollment = async (req, res) => {
    const { student_id, offering_id, status } = req.body; // status should be 'pending_advisor' or 'rejected'

    // Verify faculty owns the offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    const nextStatus = status === 'rejected' ? 'rejected' : 'pending_advisor';

    const { error } = await supabaseAdmin
        .from("enrollments")
        .update({ status: nextStatus })
        .eq("student_id", student_id)
        .eq("offering_id", offering_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: `Enrollment updated to ${nextStatus}` });
};

// Faculty Advisor: Approve enrollment (Step 2)
export const advisorApproveEnrollment = async (req, res) => {
    const { student_id, offering_id, status } = req.body; // status: 'enrolled' or 'rejected'

    // Verify faculty is advisor
    const { data: advisory } = await supabaseAdmin
        .from("faculty_advisors")
        .select("faculty_id")
        .eq("faculty_id", req.user.id)
        .eq("student_id", student_id)
        .single();

    if (!advisory) return res.status(403).json({ error: "Not advisor for this student" });

    const nextStatus = status === 'rejected' ? 'rejected' : 'enrolled';

    const { error } = await supabaseAdmin
        .from("enrollments")
        .update({ status: nextStatus })
        .eq("student_id", student_id)
        .eq("offering_id", offering_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: `Enrollment updated to ${nextStatus}` });
};

// Faculty: Direct Enroll (skip approvals)
export const directEnroll = async (req, res) => {
    const { roll_number, offering_id } = req.body;

    // Verify faculty owns offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    // Resolve student ID
    const { data: student, error: sErr } = await supabaseAdmin
        .from("students")
        .select("user_id")
        .eq("roll_number", roll_number)
        .single();

    if (sErr || !student) return res.status(404).json({ error: "Student not found" });

    // Call DB function for direct enrollment
    const { error } = await supabaseAdmin
        .rpc("direct_enroll_student", {
            p_student_id: student.user_id,
            p_offering_id: offering_id
        });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Student directly enrolled" });
};

// View Pending Enrollment Requests (for my courses)
export const getPendingRequests = async (req, res) => {
    // Get offerings taught by me
    const { data: offerings } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("faculty_id", req.user.id);

    if (!offerings?.length) return res.json([]);

    const offeringIds = offerings.map(o => o.id);

    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select(`
            status,
            enrolled_at,
            students (roll_number, user_id, user:users(name)),
            offering:course_offerings (id, courses(course_code)) 
        `)
        .in("offering_id", offeringIds)
        .eq("status", "pending_faculty");

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// View Pending Advisor Requests (for my advisees)
export const getAdvisorRequests = async (req, res) => {
    // Get my advisees
    const { data: advisees } = await supabaseAdmin
        .from("faculty_advisors")
        .select("student_id")
        .eq("faculty_id", req.user.id);

    if (!advisees?.length) return res.json([]);
    const studentIds = advisees.map(a => a.student_id);

    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select(`
            status,
            enrolled_at,
            students (roll_number, user_id, user:users(name)),
            offering:course_offerings (id, courses(course_code))
        `)
        .in("student_id", studentIds)
        .eq("status", "pending_advisor");

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};
