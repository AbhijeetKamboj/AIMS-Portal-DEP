-- ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- USERS (Supabase auth users mapped later)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role_id INT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- STUDENTS
CREATE TABLE students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    roll_number TEXT UNIQUE NOT NULL,
    department TEXT,
    batch INT
);

-- FACULTY
CREATE TABLE faculty (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    department TEXT
);

-- FACULTY ADVISORS
CREATE TABLE faculty_advisors (
    faculty_id UUID REFERENCES faculty(user_id),
    student_id UUID REFERENCES students(user_id),
    PRIMARY KEY (faculty_id, student_id)
);

-- SEMESTERS
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    name TEXT,
    max_credits INT DEFAULT 24,
    start_date DATE,
    end_date DATE,
    grade_locked BOOLEAN DEFAULT FALSE
);

-- COURSES
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    credits INT CHECK (credits > 0),
    department TEXT
);

-- COURSE OFFERINGS
CREATE TABLE course_offerings (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id),
    semester_id INT REFERENCES semesters(id),
    faculty_id UUID REFERENCES faculty(user_id)
);

-- ENROLLMENTS
CREATE TABLE enrollments (
    student_id UUID REFERENCES students(user_id),
    offering_id INT REFERENCES course_offerings(id),
    enrolled_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (student_id, offering_id)
);
