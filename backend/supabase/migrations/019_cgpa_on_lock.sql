-- Drop existing CGPA trigger (it fires on every grade insert)
DROP TRIGGER IF EXISTS cgpa_trigger ON grades;

-- Create new trigger that fires when semester is locked
CREATE OR REPLACE FUNCTION recalculate_all_cgpa_for_semester()
RETURNS TRIGGER AS $$
BEGIN
    -- Only recalculate if grade_locked changed to TRUE
    IF NEW.grade_locked = TRUE AND (OLD.grade_locked = FALSE OR OLD.grade_locked IS NULL) THEN
        -- Recalculate CGPA for all students who have grades in this semester
        INSERT INTO cumulative_gpa (student_id, cgpa, total_credits)
        SELECT
            bca.student_id,
            ROUND(SUM(bca.credits * bca.grade_point) / NULLIF(SUM(bca.credits), 0), 2),
            SUM(bca.credits)::INT
        FROM best_course_attempts bca
        WHERE bca.student_id IN (
            SELECT DISTINCT g.student_id 
            FROM grades g
            JOIN course_offerings co ON g.offering_id = co.id
            WHERE co.semester_id = NEW.id
        )
        GROUP BY bca.student_id
        ON CONFLICT (student_id)
        DO UPDATE SET
            cgpa = EXCLUDED.cgpa,
            total_credits = EXCLUDED.total_credits;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on semesters table for when grade_locked changes
DROP TRIGGER IF EXISTS semester_lock_cgpa_trigger ON semesters;
CREATE TRIGGER semester_lock_cgpa_trigger
AFTER UPDATE ON semesters
FOR EACH ROW
EXECUTE FUNCTION recalculate_all_cgpa_for_semester();

-- Keep SGPA trigger as is (updates on every grade insert)
-- SGPA is per-semester so it makes sense to update immediately
