-- BEST ATTEMPT VIEW
CREATE OR REPLACE VIEW best_course_attempts AS
SELECT DISTINCT ON (g.student_id, c.id)
    g.student_id,
    c.id AS course_id,
    gs.grade_point,
    c.credits
FROM grades g
JOIN course_offerings co ON g.offering_id = co.id
JOIN courses c ON co.course_id = c.id
JOIN grade_scale gs ON g.grade = gs.grade
WHERE g.grade NOT IN ('F', 'W')
ORDER BY g.student_id, c.id, g.attempt DESC;

-- SGPA TRIGGER
CREATE OR REPLACE FUNCTION update_sgpa()
RETURNS TRIGGER AS $$
DECLARE sem_id INT;
BEGIN
    SELECT semester_id INTO sem_id FROM course_offerings WHERE id = NEW.offering_id;

    DELETE FROM semester_gpa
    WHERE student_id = NEW.student_id AND semester_id = sem_id;

    INSERT INTO semester_gpa
    SELECT
        NEW.student_id,
        sem_id,
        ROUND(SUM(c.credits * gs.grade_point) / SUM(c.credits), 2),
        SUM(c.credits)
    FROM grades g
    JOIN course_offerings co ON g.offering_id = co.id
    JOIN courses c ON co.course_id = c.id
    JOIN grade_scale gs ON g.grade = gs.grade
    WHERE g.student_id = NEW.student_id AND co.semester_id = sem_id
    GROUP BY g.student_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sgpa_trigger
AFTER INSERT OR UPDATE ON grades
FOR EACH ROW
EXECUTE FUNCTION update_sgpa();

-- CGPA TRIGGER
CREATE OR REPLACE FUNCTION update_cgpa()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cumulative_gpa
    SELECT
        student_id,
        ROUND(SUM(credits * grade_point) / SUM(credits), 2),
        SUM(credits)
    FROM best_course_attempts
    WHERE student_id = NEW.student_id
    GROUP BY student_id
    ON CONFLICT (student_id)
    DO UPDATE SET
        cgpa = EXCLUDED.cgpa,
        total_credits = EXCLUDED.total_credits;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cgpa_trigger
AFTER INSERT OR UPDATE ON grades
FOR EACH ROW
EXECUTE FUNCTION update_cgpa();
