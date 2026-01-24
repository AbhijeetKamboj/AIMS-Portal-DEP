-- Ensure grades table exists (if not created in init)
CREATE TABLE IF NOT EXISTS grades (
    student_id UUID REFERENCES students(user_id),
    offering_id INT REFERENCES course_offerings(id),
    grade TEXT,
    attempt INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (student_id, offering_id)
);

-- Grade Points Calculation Function
CREATE OR REPLACE FUNCTION get_grade_points(grade text) RETURNS numeric AS $$
BEGIN
    RETURN CASE grade
        WHEN 'A' THEN 10
        WHEN 'A-' THEN 9
        WHEN 'B' THEN 8
        WHEN 'B-' THEN 7
        WHEN 'C' THEN 6
        WHEN 'C-' THEN 5
        WHEN 'D' THEN 4
        WHEN 'E' THEN 2
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Robust Cleanup: Handle both Table and View
DO $$ 
BEGIN 
    BEGIN
        DROP TABLE IF EXISTS semester_gpa CASCADE;
    EXCEPTION WHEN wrong_object_type THEN 
        NULL;
    END;
    BEGIN
        DROP VIEW IF EXISTS semester_gpa CASCADE;
    EXCEPTION WHEN wrong_object_type THEN 
        NULL;
    END;
    
    BEGIN
        DROP TABLE IF EXISTS cumulative_gpa CASCADE;
    EXCEPTION WHEN wrong_object_type THEN 
        NULL;
    END;
    BEGIN
        DROP VIEW IF EXISTS cumulative_gpa CASCADE;
    EXCEPTION WHEN wrong_object_type THEN 
        NULL;
    END;
END $$;

-- Semester GPA View
CREATE OR REPLACE VIEW semester_gpa AS
SELECT
    g.student_id,
    co.semester_id,
    s.name as semester_name,
    CAST(SUM(get_grade_points(g.grade) * c.credits) AS NUMERIC) / NULLIF(SUM(c.credits), 0) as sgpa,
    SUM(c.credits) as total_credits
FROM grades g
JOIN course_offerings co ON g.offering_id = co.id
JOIN courses c ON co.course_id = c.id
JOIN semesters s ON co.semester_id = s.id
GROUP BY g.student_id, co.semester_id, s.name;

-- Cumulative GPA View
CREATE OR REPLACE VIEW cumulative_gpa AS
SELECT
    g.student_id,
    CAST(SUM(get_grade_points(g.grade) * c.credits) AS NUMERIC) / NULLIF(SUM(c.credits), 0) as cgpa,
    SUM(c.credits) as total_credits
FROM grades g
JOIN course_offerings co ON g.offering_id = co.id
JOIN courses c ON co.course_id = c.id
GROUP BY g.student_id;
