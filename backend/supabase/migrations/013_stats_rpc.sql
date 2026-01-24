CREATE OR REPLACE FUNCTION get_offerings_with_stats(p_semester_id INT DEFAULT NULL)
RETURNS TABLE (
    id INT,
    course_code TEXT,
    course_name TEXT,
    credits INT,
    l INT, t INT, p INT, s INT,
    faculty_name TEXT,
    status TEXT,
    offering_dept_id INT,
    semester_id INT,
    enrolled_count BIGINT,
    pending_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        co.id,
        c.course_code,
        c.course_name,
        c.credits,
        c.l, c.t, c.p, c.s,
        u.name as faculty_name,
        co.status,
        co.offering_dept_id,
        co.semester_id,
        (SELECT COUNT(*) FROM enrollments e WHERE e.offering_id = co.id AND e.status = 'enrolled') as enrolled_count,
        (SELECT COUNT(*) FROM enrollments e WHERE e.offering_id = co.id AND e.status IN ('pending_faculty', 'pending_advisor')) as pending_count
    FROM course_offerings co
    JOIN courses c ON co.course_id = c.id
    JOIN faculty f ON co.faculty_id = f.user_id
    JOIN users u ON f.user_id = u.id
    WHERE (p_semester_id IS NULL OR co.semester_id = p_semester_id);
END;
$$ LANGUAGE plpgsql;
