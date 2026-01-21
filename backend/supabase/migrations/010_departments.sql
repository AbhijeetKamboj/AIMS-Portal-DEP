-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL
);

-- Seed initial departments (Common ones)
INSERT INTO departments (name, code) VALUES 
('Computer Science and Engineering', 'CSE'),
('Electrical Engineering', 'EE'),
('Mechanical Engineering', 'ME'),
('Civil Engineering', 'CE'),
('Mathematics', 'MA'),
('Physics', 'PH'),
('Humanities and Social Sciences', 'HSS');

-- Update Course Offerings
ALTER TABLE course_offerings
ADD COLUMN offering_dept_id INT REFERENCES departments(id),
ADD COLUMN allowed_dept_ids INT[]; -- Array of INTs
