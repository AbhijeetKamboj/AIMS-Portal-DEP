-- 1. Ensure enrollments has an ID column for frontend usage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'id') THEN
        ALTER TABLE enrollments ADD COLUMN id UUID DEFAULT gen_random_uuid();
    END IF;
END $$;

-- 2. Update student_transcript RPC to return full details including status and type
DROP FUNCTION IF EXISTS student_transcript(uuid);

CREATE OR REPLACE FUNCTION student_transcript(sid UUID)
RETURNS TABLE (
    semester TEXT,
    start_date DATE,
    course_code TEXT,
    course_name TEXT,
    credits INT,
    l INT,
    t INT,
    p INT,
    s INT,
    c INT,
    grade TEXT,
    attempt INT,
    status TEXT,
    enrollment_type TEXT,
    enrollment_id UUID,
    offering_id INT
)
LANGUAGE sql
AS $$
    SELECT
        sem.name,
        sem.start_date,
        c.course_code,
        c.course_name,
        c.credits,
        c.l,
        c.t,
        c.p,
        c.s,
        c.credits,
        g.grade,
        coalesce(g.attempt, 1),
        e.status,
        e.enrollment_type,
        e.id,
        co.id
    FROM enrollments e
    JOIN course_offerings co ON e.offering_id = co.id
    JOIN courses c ON co.course_id = c.id
    JOIN semesters sem ON co.semester_id = sem.id
    LEFT JOIN grades g ON e.student_id = g.student_id AND e.offering_id = g.offering_id
    WHERE e.student_id = sid
    ORDER BY sem.start_date DESC, c.course_code;
$$;
