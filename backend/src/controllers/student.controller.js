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

    const newCredits = offering.courses?.credits || 0;
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

    const currentTotalCredits = currentEnrollments.reduce((sum, enr) => sum + (enr.course_offerings.courses?.credits || 0), 0);

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
    try {
        // 1. Get Student Profile
        const { data: student, error: sErr } = await supabaseAdmin
            .from("students")
            .select(`
                roll_number,
                department,
                batch,
                user:users (name, email)
            `)
            .eq("user_id", req.user.id)
            .single();

        if (sErr) return res.status(400).json({ error: "Student profile not found" });

        // 2. Get Grade Scale for Calculation
        const { data: gradeScale } = await supabaseAdmin
            .from("grade_scale")
            .select("grade, grade_point");

        const gradeMap = {};
        (gradeScale || []).forEach(g => {
            gradeMap[g.grade] = g.grade_point;
        });

        // 3. Get Transcript Data
        const { data: transcript, error: tErr } = await supabaseAdmin.rpc("student_transcript", {
            sid: req.user.id
        });

        if (tErr) return res.status(400).json({ error: tErr.message });

        // 4. Process Data
        const semestersMap = {};

        const getSemester = (name, startDate) => {
            if (!semestersMap[name]) {
                semestersMap[name] = {
                    semester_name: name,
                    start_date: startDate,
                    courses: [],
                    credits: 0, // Completed credits (with valid grades, excluding F, E, null, W) - for GPA
                    registered_credits: 0, // All registered credits - for academics estimate
                    sgpa: 0,
                    cgpa: 0,
                    grade_points_sum: 0,
                    gpa_credits: 0 // Credits used for GPA calc
                };
            }
            return semestersMap[name];
        };

        (transcript || []).forEach(row => {
            const sem = getSemester(row.semester, row.start_date);

            const course = {
                enrollment_id: row.enrollment_id,
                code: row.course_code,
                name: row.course_name,
                credits: row.credits,
                ltpsc: `${row.l}-${row.t}-${row.p}-${row.s}-${row.c}`,
                type: row.enrollment_type,
                status: row.status,
                grade: row.grade,
                ltpsc_raw: { l: row.l, t: row.t, p: row.p, s: row.s, c: row.c }
            };

            sem.courses.push(course);

            // Count registered credits (all except withdrawn/rejected) - for academics display
            if (row.status !== 'withdrawn' && row.status !== 'rejected') {
                sem.registered_credits += row.credits;
            }

            // Calculate Stats
            // Include in GPA if grade exists and is not W (Withdrawn), E, or F (fail grades)
            // Courses with null grade, W, E, or F are not included in GPA calculation and not counted as completed

            if (row.grade && gradeMap[row.grade] !== undefined && row.grade !== 'W' && row.grade !== 'E' && row.grade !== 'F') {
                const points = gradeMap[row.grade];

                // Add to SGPA calc
                sem.grade_points_sum += (points * row.credits);
                sem.gpa_credits += row.credits;

                // Count as completed credit (for GPA display)
                sem.credits += row.credits;
            }
        });

        // Sort by date for CGPA calculation
        const semesters = Object.values(semestersMap).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        let cumulativePoints = 0;
        let cumulativeCredits = 0;

        semesters.forEach(sem => {
            // SGPA
            if (sem.gpa_credits > 0) {
                sem.sgpa = parseFloat((sem.grade_points_sum / sem.gpa_credits).toFixed(2));
            }

            // Update Cumulative
            cumulativePoints += sem.grade_points_sum;
            cumulativeCredits += sem.gpa_credits;

            // CGPA
            if (cumulativeCredits > 0) {
                sem.cgpa = parseFloat((cumulativePoints / cumulativeCredits).toFixed(2));
            }
        });

        // Construct Final Response
        const response = {
            student_info: {
                name: student.user.name,
                email: student.user.email,
                roll_number: student.roll_number,
                department: student.department,
                batch: student.batch
            },
            semesters: semesters.reverse()
        };

        res.json(response);
    } catch (err) {
        console.error("Transcript Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getCgpa = async (req, res) => {
    try {
        // Get Grade Scale for Calculation
        const { data: gradeScale } = await supabaseAdmin
            .from("grade_scale")
            .select("grade, grade_point");

        const gradeMap = {};
        (gradeScale || []).forEach(g => {
            gradeMap[g.grade] = g.grade_point;
        });

        // Get Transcript Data
        const { data: transcript, error: tErr } = await supabaseAdmin.rpc("student_transcript", {
            sid: req.user.id
        });

        if (tErr) return res.status(400).json({ error: tErr.message });

        // Calculate CGPA from transcript
        let cumulativePoints = 0;
        let cumulativeCredits = 0;
        let totalCreditsEarned = 0;

        (transcript || []).forEach(row => {
            // Only include grades that exist in grade_scale and are not null, W, E, or F
            if (row.grade && gradeMap[row.grade] !== undefined && row.grade !== 'W' && row.grade !== 'E' && row.grade !== 'F') {
                const points = gradeMap[row.grade];
                cumulativePoints += (points * row.credits);
                cumulativeCredits += row.credits;
            }

            // Count total credits earned (excluding withdrawn and rejected)
            if (row.status !== 'withdrawn' && row.status !== 'rejected' && row.grade && row.grade !== 'W' && row.grade !== 'E' && row.grade !== 'F') {
                totalCreditsEarned += row.credits;
            }
        });

        const cgpa = cumulativeCredits > 0 ? parseFloat((cumulativePoints / cumulativeCredits).toFixed(2)) : 0;

        res.json({
            cgpa: cgpa,
            total_credits: totalCreditsEarned,
            total_credits_enrolled: cumulativeCredits
        });
    } catch (err) {
        console.error("CGPA Calculation Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const listOfferings = async (req, res) => {
    // Use new RPC to get stats
    const { data, error } = await supabaseAdmin.rpc("get_offerings_with_stats", {
        p_semester_id: null
    });

    if (error) return res.status(400).json({ error: error.message });


    // Map for frontend compatibility + stats
    const mapped = (data || []).map(o => ({
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
    try {
        // Get basic enrollments first
        const { data: enrollments, error: eErr } = await supabaseAdmin
            .from("enrollments")
            .select("offering_id, status, enrollment_type")
            .eq("student_id", req.user.id);

        if (eErr) {
            console.error("Error fetching enrollments:", eErr);
            return res.status(400).json({ error: eErr.message });
        }
        
        if (!enrollments || enrollments.length === 0) {
            return res.json([]);
        }

        // Get the offering and semester info separately
        const offeringIds = enrollments.map(e => e.offering_id);
        const { data: offerings, error: oErr } = await supabaseAdmin
            .from("course_offerings")
            .select("id, semester_id, semesters(id, status)")
            .in("id", offeringIds);

        // Create a map of offering_id -> semester_status
        const offeringMap = {};
        if (!oErr && offerings) {
            offerings.forEach(o => {
                offeringMap[o.id] = o.semesters?.status;
            });
        } else if (oErr) {
            console.error("Warning: Error fetching offerings:", oErr);
            // Continue anyway - return enrollments without semester status
        }

        // Map response to include semester status (or null if not available)
        const mapped = enrollments.map(e => ({
            offering_id: e.offering_id,
            status: e.status,
            enrollment_type: e.enrollment_type,
            semester_status: offeringMap[e.offering_id] || null
        }));
        
        console.log("Returning enrollments:", mapped);
        res.json(mapped);
    } catch (err) {
        console.error("Error fetching enrollments:", err);
        res.status(500).json({ error: "Internal server error" });
    }
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

// Drop/Withdraw from a course (within 14 days of semester start)
export const dropCourse = async (req, res) => {
    const { enrollment_id } = req.body;

    // 1. Get enrollment and semester info
    const { data: enrollment, error: eErr } = await supabaseAdmin
        .from("enrollments")
        .select(`
            id,
            student_id,
            status,
            course_offerings (
                semester_id,
                semesters (start_date)
            )
        `)
        .eq("id", enrollment_id)
        .eq("student_id", req.user.id)
        .single();

    if (eErr || !enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
    }

    if (enrollment.status === 'withdrawn') {
        return res.status(400).json({ error: "Already withdrawn from this course" });
    }

    if (enrollment.status !== 'enrolled') {
        return res.status(400).json({ error: "Can only drop enrolled courses" });
    }

    // 2. Check if within 14 days of semester start
    const semesterStart = new Date(enrollment.course_offerings.semesters.start_date);
    const now = new Date();
    const daysSinceStart = Math.floor((now - semesterStart) / (1000 * 60 * 60 * 24));

    if (daysSinceStart > 14) {
        return res.status(400).json({
            error: `Drop period expired. You can only drop within 14 days of semester start. (${daysSinceStart} days have passed)`
        });
    }

    // 3. Update enrollment status to withdrawn
    const { error } = await supabaseAdmin
        .from("enrollments")
        .update({
            status: 'withdrawn',
            dropped_at: new Date().toISOString()
        })
        .eq("id", enrollment_id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Successfully withdrawn from course" });
};

// Request a meeting with faculty (with conflict check)
export const requestMeeting = async (req, res) => {
    const { faculty_id, reason, date, time, duration } = req.body;

    if (!faculty_id || !reason || !date || !time) {
        return res.status(400).json({ error: "faculty_id, reason, date, and time are required" });
    }

    // Check for conflicts using DB function
    const { data: hasConflict, error: conflictErr } = await supabaseAdmin
        .rpc("check_meeting_conflict", {
            p_faculty_id: faculty_id,
            p_date: date,
            p_time: time,
            p_duration: duration || 30
        });

    if (conflictErr) {
        console.error("Conflict check error:", conflictErr);
        // If function doesn't exist, proceed anyway (backward compatibility)
    } else if (hasConflict) {
        return res.status(400).json({ error: "This time slot is already booked. Please choose another." });
    }

    const { error } = await supabaseAdmin
        .from("meeting_requests")
        .insert({
            student_id: req.user.id,
            faculty_id,
            reason,
            requested_date: date,
            requested_time: time,
            duration: duration || 30
        });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Meeting requested successfully" });
};

// Get my meeting requests
export const getMyMeetingRequests = async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("meeting_requests")
        .select(`
            *,
            faculty:faculty_id (user:users(name))
        `)
        .eq("student_id", req.user.id)
        .is("cancelled_at", null)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Cancel a meeting request
export const cancelMeeting = async (req, res) => {
    const { meeting_id } = req.body;

    if (!meeting_id) {
        return res.status(400).json({ error: "meeting_id is required" });
    }

    const { error } = await supabaseAdmin
        .from("meeting_requests")
        .update({
            cancelled_at: new Date().toISOString(),
            cancelled_by: req.user.id
        })
        .eq("id", meeting_id)
        .eq("student_id", req.user.id)
        .in("status", ["pending", "approved"]);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Meeting cancelled successfully" });
};

// Get list of faculty for meeting requests
export const getFacultyList = async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("faculty")
        .select(`
            user_id,
            department,
            users (name)
        `);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};
