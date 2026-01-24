-- Allow 'completed' status in course_offerings
ALTER TABLE course_offerings 
DROP CONSTRAINT IF EXISTS course_offerings_status_check;

ALTER TABLE course_offerings
ADD CONSTRAINT course_offerings_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'));
