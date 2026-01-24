CREATE OR REPLACE FUNCTION student_transcript(sid UUID)
RETURNS TABLE (
    semester TEXT,
    course_code TEXT,
    course_name TEXT,
    credits INT,
    grade TEXT,
    attempt INT
)
LANGUAGE sql
AS $$
    SELECT
        sem.name,
        c.course_code,
        c.course_name,
        c.credits,
        g.grade,
        g.attempt
    FROM grades g
    JOIN course_offerings co ON g.offering_id = co.id
    JOIN courses c ON co.course_id = c.id
    JOIN semesters sem ON co.semester_id = sem.id
    WHERE g.student_id = sid
    ORDER BY sem.start_date, c.course_code, g.attempt;
$$;

CREATE OR REPLACE FUNCTION student_sgpa(sid UUID)
RETURNS TABLE (
    semester TEXT,
    sgpa DECIMAL,
    total_credits INT
)
LANGUAGE sql
AS $$
    SELECT
        sem.name,
        sg.sgpa,
        sg.total_credits
    FROM semester_gpa sg
    JOIN semesters sem ON sg.semester_id = sem.id
    WHERE sg.student_id = sid
    ORDER BY sem.start_date;
$$;
