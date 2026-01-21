-- GRADE SCALE
CREATE TABLE grade_scale (
    grade TEXT PRIMARY KEY,
    grade_point DECIMAL(4,2) NOT NULL
);

INSERT INTO grade_scale VALUES
('A', 10.00),
('A-', 9.00),
('B+', 8.00),
('B-', 7.00),
('C', 6.00),
('C-', 5.00),
('D', 4.00),
('F', 0.00),
('W', 0.00);

-- GRADES
CREATE TABLE grades (
    student_id UUID REFERENCES students(user_id),
    offering_id INT REFERENCES course_offerings(id),
    grade TEXT REFERENCES grade_scale(grade),
    attempt INT DEFAULT 1,
    PRIMARY KEY (student_id, offering_id)
);

-- SGPA
CREATE TABLE semester_gpa (
    student_id UUID REFERENCES students(user_id),
    semester_id INT REFERENCES semesters(id),
    sgpa DECIMAL(4,2),
    total_credits INT,
    PRIMARY KEY (student_id, semester_id)
);

-- CGPA
CREATE TABLE cumulative_gpa (
    student_id UUID PRIMARY KEY REFERENCES students(user_id),
    cgpa DECIMAL(4,2),
    total_credits INT
);
