-- Add created_at column if it doesn't exist
ALTER TABLE grades ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
