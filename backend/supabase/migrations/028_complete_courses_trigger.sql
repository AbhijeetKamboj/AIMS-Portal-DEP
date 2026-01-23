-- Trigger to mark courses as completed when semester is locked
CREATE OR REPLACE FUNCTION mark_offerings_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.grade_locked = TRUE AND (OLD.grade_locked = FALSE OR OLD.grade_locked IS NULL) THEN
        UPDATE course_offerings
        SET status = 'completed'
        WHERE semester_id = NEW.id
          AND status = 'approved'; -- Only complete approved courses
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sem_lock_complete_courses
AFTER UPDATE ON semesters
FOR EACH ROW
EXECUTE FUNCTION mark_offerings_completed();
