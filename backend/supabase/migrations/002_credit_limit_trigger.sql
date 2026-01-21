CREATE OR REPLACE FUNCTION enforce_credit_limit()
RETURNS TRIGGER AS $$
DECLARE
    total INT;
    course_credits INT;
BEGIN
    SELECT COALESCE(SUM(c.credits), 0)
    INTO total
    FROM enrollments e
    JOIN course_offerings co ON e.offering_id = co.id
    JOIN courses c ON co.course_id = c.id
    WHERE e.student_id = NEW.student_id
      AND co.semester_id = (
          SELECT semester_id FROM course_offerings WHERE id = NEW.offering_id
      );

    SELECT credits INTO course_credits
    FROM courses
    WHERE id = (SELECT course_id FROM course_offerings WHERE id = NEW.offering_id);

    IF total + course_credits > 24 THEN
        RAISE EXCEPTION 'Credit limit exceeded';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credit_limit_trigger
BEFORE INSERT ON enrollments
FOR EACH ROW
EXECUTE FUNCTION enforce_credit_limit();
