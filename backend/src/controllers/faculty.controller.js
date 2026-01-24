import { supabaseAdmin } from "../config/supabaseAdmin.js";

// Existing grade submission (Faculty) - Sets status to 'pending'
export const submitGrade = async (req, res) => {
    const { student_id, offering_id, grade, attempt } = req.body;

    const { error } = await supabaseAdmin
        .from("grades")
        .upsert({
            student_id,
            offering_id,
            grade,
            attempt,
            status: 'pending',
            submitted_at: new Date().toISOString()
        });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Grade submitted (pending approval)" });
};

// Faculty: Bulk Upload Grades (CSV)
export const uploadGrades = async (req, res) => {
    const { grades } = req.body; // Expects [{ roll_number, grade }] and offering_id in query or body?
    // Let's assume offering_id is passed in body for the whole batch, or per row.
    // Usually bulk upload is for a specific course.
    const { offering_id } = req.body;

    if (!grades || !Array.isArray(grades) || !offering_id) {
        return res.status(400).json({ error: "Invalid input. key 'grades' (array) and 'offering_id' required" });
    }

    // Verify faculty owns offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    const results = { success: 0, failed: 0, errors: [] };

    for (const item of grades) {
        const { roll_number, grade } = item;
        try {
            const { data: student } = await supabaseAdmin
                .from("students")
                .select("user_id")
                .ilike("roll_number", roll_number.trim())
                .single();

            if (!student) {
                results.failed++;
                results.errors.push({ roll_number, error: "Student not found" });
                continue;
            }

            // Upsert with pending
            const { error } = await supabaseAdmin
                .from("grades")
                .upsert({
                    student_id: student.user_id,
                    offering_id,
                    grade,
                    status: 'pending',
                    submitted_at: new Date().toISOString()
                }, { onConflict: 'student_id, offering_id' }); // Conflict on unique constraint

            if (error) throw error;
            results.success++;

        } catch (err) {
            results.failed++;
            results.errors.push({ roll_number, error: err.message });
        }
    }

    res.json({ results, message: "Bulk upload processed. Grades are pending approval." });
};

// Course Faculty: Approve All pending enrollments for an offering
export const approveAllEnrollments = async (req, res) => {
    const { offering_id } = req.body;

    // Verify faculty owns the offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    const { error } = await supabaseAdmin
        .from("enrollments")
        .update({ status: 'pending_advisor' }) // Next step
        .eq("offering_id", offering_id)
        .eq("status", "pending_faculty");

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "All pending requests approved" });
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

// Faculty Advisor: Approve ALL pending requests
export const advisorApproveAll = async (req, res) => {
    // We approve all 'pending_advisor' requests where existing faculty is the advisor.
    // This is slightly complex SQL or multiple steps. 
    // Simplest: Get all pending_advisor enrollments for this advisor's students.

    // 1. Get my advisees
    const { data: advisees } = await supabaseAdmin
        .from("faculty_advisors")
        .select("student_id")
        .eq("faculty_id", req.user.id);

    if (!advisees?.length) return res.json({ message: "No advisees found" });
    const studentIds = advisees.map(a => a.student_id);

    // 2. Update status
    const { error } = await supabaseAdmin
        .from("enrollments")
        .update({ status: 'enrolled' })
        .in("student_id", studentIds)
        .eq("status", "pending_advisor");

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "All pending advisor requests approved" });
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
        .ilike("roll_number", roll_number)
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

// Get my courses (offerings) - both active and completed
export const getMyCourses = async (req, res) => {
    const { status } = req.query; // Optional: 'approved', 'completed', or 'all'

    let query = supabaseAdmin
        .from("course_offerings")
        .select(`
            id,
            semester_id,
            status,
            courses (id, course_code, course_name, credits, l, t, p, s),
            semesters (name)
        `)
        .eq("faculty_id", req.user.id);

    if (status === 'approved') {
        query = query.eq("status", "approved");
    } else if (status === 'completed') {
        query = query.eq("status", "completed");
    } else {
        // Default: get both approved and completed
        query = query.in("status", ["approved", "completed"]);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Create announcement for a course
export const createAnnouncement = async (req, res) => {
    const { offering_id, title, content } = req.body;

    // Verify faculty owns offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    const { data, error } = await supabaseAdmin
        .from("announcements")
        .insert({ offering_id, title, content })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Get announcements for a course
export const getAnnouncements = async (req, res) => {
    const { offering_id } = req.query;

    const { data, error } = await supabaseAdmin
        .from("announcements")
        .select("*")
        .eq("offering_id", offering_id)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Upload course material
export const uploadMaterial = async (req, res) => {
    const { offering_id, title, file_url } = req.body;

    // Verify faculty owns offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    const { data, error } = await supabaseAdmin
        .from("course_materials")
        .insert({ offering_id, title, file_url })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Get course materials
export const getMaterials = async (req, res) => {
    const { offering_id } = req.query;

    const { data, error } = await supabaseAdmin
        .from("course_materials")
        .select("*")
        .eq("offering_id", offering_id)
        .order("uploaded_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Get meeting requests for faculty
export const getMeetingRequests = async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("meeting_requests")
        .select(`
            *,
            students (roll_number, user:users(name))
        `)
        .eq("faculty_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

import { createEvent, deleteEvent } from "../services/googleCalendar.js";

// Respond to meeting request
export const respondMeeting = async (req, res) => {
    const { request_id, status, response } = req.body;

    // First fetch the meeting details to verify ownership and get info for calendar
    const { data: meeting, error: fetchError } = await supabaseAdmin
        .from("meeting_requests")
        .select(`
            *,
            students (user:users(name, email))
        `)
        .eq("id", request_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (fetchError || !meeting) {
        return res.status(404).json({ error: "Meeting request not found" });
    }

    let updates = { status, response };

    // Calendar Sync Logic
    try {
        if (status === 'approved') {
            const dateStr = meeting.requested_date;
            const timeStr = meeting.requested_time;

            // Ensure we create a valid DATE object. 
            // Postgres DATE (YYYY-MM-DD) and TIME (HH:MM:SS) combine well into ISO.
            const startDateTime = new Date(`${dateStr}T${timeStr}`);

            if (isNaN(startDateTime.getTime())) {
                throw new Error(`Invalid meeting date/time: ${dateStr}T${timeStr}`);
            }

            const meetingDetails = {
                student_name: meeting.students?.user?.name || 'Student',
                reason: meeting.reason,
                start_time: startDateTime.toISOString(),
                end_time: calculateEndTime(dateStr, timeStr, meeting.duration || 30)
            };

            const googleEventId = await createEvent(req.user.id, meetingDetails);
            if (googleEventId) {
                updates.google_event_id = googleEventId;
            }
        }
        else if (status === 'rejected' && meeting.google_event_id) {
            await deleteEvent(req.user.id, meeting.google_event_id);
            updates.google_event_id = null;
        }
    } catch (calError) {
        console.error("Google Calendar Sync Error:", calError);
        updates.response = (updates.response || "") + " [Calendar Sync Failed]";
    }

    const { error } = await supabaseAdmin
        .from("meeting_requests")
        .update(updates)
        .eq("id", request_id);

    // Handle schema cache errors - if google_event_id column not in schema cache, retry or skip
    if (error && error.message?.includes("google_event_id")) {
        console.warn("Schema cache stale, retrying update without google_event_id");
        // Remove google_event_id from updates and try again
        const { google_event_id, ...safeUpdates } = updates;
        const { error: retryError } = await supabaseAdmin
            .from("meeting_requests")
            .update(safeUpdates)
            .eq("id", request_id);
        
        if (retryError) return res.status(400).json({ error: retryError.message });
    } else if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Meeting request updated" });
};

// Helper: Calculate end time string
const calculateEndTime = (dateStr, timeStr, durationMinutes) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(date.getTime())) return new Date().toISOString();
    date.setMinutes(date.getMinutes() + durationMinutes);
    return date.toISOString();
};

// Bulk enroll students
export const bulkEnroll = async (req, res) => {
    const { offering_id, roll_numbers } = req.body;

    if (!Array.isArray(roll_numbers)) {
        return res.status(400).json({ error: "roll_numbers must be an array" });
    }

    // Verify faculty owns offering
    const { data: offering } = await supabaseAdmin
        .from("course_offerings")
        .select("id")
        .eq("id", offering_id)
        .eq("faculty_id", req.user.id)
        .single();

    if (!offering) return res.status(403).json({ error: "Not authorized for this offering" });

    const results = { success: 0, failed: 0, errors: [] };

    for (const roll_number of roll_numbers) {
        // Resolve student ID (case-insensitive)
        const { data: student } = await supabaseAdmin
            .from("students")
            .select("user_id")
            .ilike("roll_number", roll_number.trim())
            .single();

        if (!student) {
            results.failed++;
            results.errors.push({ roll_number, error: "Student not found" });
            continue;
        }

        // Check if already enrolled
        const { data: existing } = await supabaseAdmin
            .from("enrollments")
            .select("id")
            .eq("student_id", student.user_id)
            .eq("offering_id", offering_id)
            .single();

        if (existing) {
            results.failed++;
            results.errors.push({ roll_number, error: "Already enrolled" });
            continue;
        }

        // Enroll directly with 'enrolled' status
        const { error } = await supabaseAdmin
            .from("enrollments")
            .insert({
                student_id: student.user_id,
                offering_id,
                status: 'enrolled',
                enrollment_type: 'credit'
            });

        if (error) {
            results.failed++;
            results.errors.push({ roll_number, error: error.message });
        } else {
            results.success++;
        }
    }

    res.json({ results });
};
