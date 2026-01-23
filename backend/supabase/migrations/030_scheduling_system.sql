-- Faculty Availability Slots (Recurring Weekly)
CREATE TABLE IF NOT EXISTS faculty_availability (
    id SERIAL PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(user_id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT DEFAULT 30, -- Duration in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(faculty_id, day_of_week, start_time)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_availability_faculty ON faculty_availability(faculty_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON faculty_availability(day_of_week);

-- Enhance meeting_requests table
ALTER TABLE meeting_requests 
ADD COLUMN IF NOT EXISTS duration INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add index for conflict detection
CREATE INDEX IF NOT EXISTS idx_meetings_faculty_date ON meeting_requests(faculty_id, requested_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meeting_requests(status);

-- Function to check for conflicts before booking
CREATE OR REPLACE FUNCTION check_meeting_conflict(
    p_faculty_id UUID,
    p_date DATE,
    p_time TIME,
    p_duration INT DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INT;
    end_time TIME;
BEGIN
    end_time := p_time + (p_duration * INTERVAL '1 minute');
    
    SELECT COUNT(*) INTO conflict_count
    FROM meeting_requests
    WHERE faculty_id = p_faculty_id
      AND requested_date = p_date
      AND status IN ('pending', 'approved')
      AND cancelled_at IS NULL
      AND (
          -- New meeting overlaps with existing
          (p_time >= requested_time AND p_time < requested_time + (COALESCE(duration, 30) * INTERVAL '1 minute'))
          OR
          (end_time > requested_time AND end_time <= requested_time + (COALESCE(duration, 30) * INTERVAL '1 minute'))
          OR
          -- Existing meeting is within new meeting window
          (requested_time >= p_time AND requested_time < end_time)
      );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get available slots for a faculty on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_faculty_id UUID,
    p_date DATE,
    p_slot_duration INT DEFAULT 30
)
RETURNS TABLE (
    slot_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    day_num INT;
BEGIN
    day_num := EXTRACT(DOW FROM p_date)::INT;
    
    RETURN QUERY
    WITH config AS (
        SELECT 
            start_time,
            end_time,
            slot_duration
        FROM faculty_availability
        WHERE faculty_id = p_faculty_id
          AND day_of_week = day_num
          AND is_active = true
    ),
    time_series AS (
        SELECT generate_series(
            (p_date + c.start_time)::timestamp, 
            (p_date + c.end_time - (c.slot_duration || ' minutes')::interval)::timestamp, 
            (c.slot_duration || ' minutes')::interval
        ) as series_time
        FROM config c
    )
    SELECT 
        ts.series_time::TIME as slot_time,
        NOT check_meeting_conflict(p_faculty_id, p_date, ts.series_time::TIME, p_slot_duration) as is_available
    FROM time_series ts
    ORDER BY ts.series_time;
END;
$$ LANGUAGE plpgsql;
