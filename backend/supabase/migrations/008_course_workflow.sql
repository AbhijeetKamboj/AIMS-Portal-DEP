-- Add LTPSC to courses
ALTER TABLE courses 
ADD COLUMN l INT NOT NULL DEFAULT 3,
ADD COLUMN t INT NOT NULL DEFAULT 0,
ADD COLUMN p INT NOT NULL DEFAULT 0,
ADD COLUMN s INT NOT NULL DEFAULT 0;

-- Add status to course_offerings
ALTER TABLE course_offerings
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add status to enrollments
ALTER TABLE enrollments
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending_faculty' CHECK (status IN ('pending_faculty', 'pending_advisor', 'enrolled', 'rejected'));

-- Function to handle direct enrollment (skip approvals)
CREATE OR REPLACE FUNCTION direct_enroll_student(
    p_student_id UUID,
    p_offering_id INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO enrollments (student_id, offering_id, status)
    VALUES (p_student_id, p_offering_id, 'enrolled')
    ON CONFLICT (student_id, offering_id) 
    DO UPDATE SET status = 'enrolled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
