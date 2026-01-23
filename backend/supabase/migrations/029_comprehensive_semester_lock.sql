-- 1. Add ID column to grades (serial for unique identification)
ALTER TABLE grades
ADD COLUMN IF NOT EXISTS id SERIAL;

-- 2. Add 'backlog' status to enrollments
ALTER TABLE enrollments
DROP CONSTRAINT IF EXISTS enrollments_status_check;

ALTER TABLE enrollments
ADD CONSTRAINT enrollments_status_check 
CHECK (status IN ('pending_faculty', 'pending_advisor', 'enrolled', 'rejected', 'completed', 'backlog', 'withdrawn'));

-- 3. Update course_offerings status constraint (ensure 'completed' is allowed)
ALTER TABLE course_offerings
DROP CONSTRAINT IF EXISTS course_offerings_status_check;

ALTER TABLE course_offerings
ADD CONSTRAINT course_offerings_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'));

-- 4. Create comprehensive semester lock function
CREATE OR REPLACE FUNCTION on_semester_lock()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act when grade_locked changes from FALSE/NULL to TRUE
    IF NEW.grade_locked = TRUE AND (OLD.grade_locked = FALSE OR OLD.grade_locked IS NULL) THEN
        
        -- a) Mark all approved course_offerings as 'completed'
        UPDATE course_offerings
        SET status = 'completed'
        WHERE semester_id = NEW.id
          AND status = 'approved';
          
        -- b) Mark enrollments as 'completed' (except F grades -> 'backlog')
        -- First: Complete all enrolled students
        UPDATE enrollments e
        SET status = 'completed'
        FROM course_offerings co
        WHERE e.offering_id = co.id
          AND co.semester_id = NEW.id
          AND e.status = 'enrolled';
          
        -- c) Mark F grades as backlog
        UPDATE enrollments e
        SET status = 'backlog'
        FROM course_offerings co, grades g
        WHERE e.offering_id = co.id
          AND co.semester_id = NEW.id
          AND g.student_id = e.student_id
          AND g.offering_id = e.offering_id
          AND g.grade = 'F';
          
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger(s) if they exist
DROP TRIGGER IF EXISTS sem_lock_complete_courses ON semesters;

-- Create new trigger
CREATE TRIGGER semester_lock_trigger
AFTER UPDATE ON semesters
FOR EACH ROW
EXECUTE FUNCTION on_semester_lock();
