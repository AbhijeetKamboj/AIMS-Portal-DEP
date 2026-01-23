-- Table to store faculty settings and third-party integrations
CREATE TABLE IF NOT EXISTS faculty_settings (
    user_id UUID PRIMARY KEY REFERENCES faculty(user_id) ON DELETE CASCADE,
    google_refresh_token TEXT,
    calendar_sync_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies (if enabled, but we are using supabaseAdmin so not strictly necessary for backend logic, 
-- but good practice if exposed via client)
ALTER TABLE faculty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view their own settings" 
ON faculty_settings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Faculty can update their own settings" 
ON faculty_settings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Faculty can insert their own settings" 
ON faculty_settings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);
