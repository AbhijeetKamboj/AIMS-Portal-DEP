-- Drop the VIEWS that conflict with the TABLES used by triggers
-- The triggers in 004_gpa_triggers.sql insert into semester_gpa and cumulative_gpa TABLES
-- Migration 015 created VIEWS with the same names which broke the triggers

DROP VIEW IF EXISTS semester_gpa CASCADE;
DROP VIEW IF EXISTS cumulative_gpa CASCADE;

-- The tables should still exist from 003_grading_and_gpa.sql
-- Just make sure they exist:
CREATE TABLE IF NOT EXISTS semester_gpa (
    student_id UUID REFERENCES students(user_id),
    semester_id INT REFERENCES semesters(id),
    sgpa DECIMAL(4,2),
    total_credits INT,
    PRIMARY KEY (student_id, semester_id)
);

CREATE TABLE IF NOT EXISTS cumulative_gpa (
    student_id UUID PRIMARY KEY REFERENCES students(user_id),
    cgpa DECIMAL(4,2),
    total_credits INT
);
