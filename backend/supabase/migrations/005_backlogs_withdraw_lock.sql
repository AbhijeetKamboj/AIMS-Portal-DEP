-- GRADE LOCK
CREATE OR REPLACE FUNCTION prevent_grade_change_when_locked()
RETURNS TRIGGER AS $$
DECLARE locked BOOLEAN;
BEGIN
    SELECT grade_locked INTO locked
    FROM semesters
    WHERE id = (
        SELECT semester_id FROM course_offerings
        WHERE id = COALESCE(NEW.offering_id, OLD.offering_id)
    );

    IF locked THEN
        RAISE EXCEPTION 'Grades are locked for this semester';
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grade_lock_trigger
BEFORE INSERT OR UPDATE OR DELETE ON grades
FOR EACH ROW
EXECUTE FUNCTION prevent_grade_change_when_locked();
