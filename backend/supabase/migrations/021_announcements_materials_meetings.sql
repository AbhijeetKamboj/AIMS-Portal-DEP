-- Announcements table for faculty to post course announcements
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    offering_id INT REFERENCES course_offerings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Course materials table for faculty to upload reading materials
CREATE TABLE IF NOT EXISTS course_materials (
    id SERIAL PRIMARY KEY,
    offering_id INT REFERENCES course_offerings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Meeting requests from students to faculty
CREATE TABLE IF NOT EXISTS meeting_requests (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
