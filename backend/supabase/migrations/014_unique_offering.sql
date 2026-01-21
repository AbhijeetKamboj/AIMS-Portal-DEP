-- First, delete duplicates if any (keeping the one with lowest ID)
DELETE FROM course_offerings a USING course_offerings b
WHERE a.id > b.id 
AND a.course_id = b.course_id 
AND a.semester_id = b.semester_id;

-- Add Unique Constraint
ALTER TABLE course_offerings 
ADD CONSTRAINT unique_course_semester UNIQUE (course_id, semester_id);
