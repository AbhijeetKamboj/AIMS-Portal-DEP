-- 007_seed_roles_and_admin.sql
-- Safe seed: create role rows if missing and ensure the admin user exists in `users`.
-- Run this in Supabase SQL editor or with your migrations tooling.

BEGIN;

-- 1) Ensure roles exist (lowercase names to match requireRole('admin'))
INSERT INTO roles (id, name)
VALUES
  (1, 'student'),
  (2, 'faculty'),
  (3, 'admin')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2) Upsert the admin mapping. Replace name/email if you want different values.
INSERT INTO users (id, name, email, role_id)
VALUES (
  'ac763883-6876-41b4-ade2-82a37e1da875', -- supabase auth user id
  'Admin',
  'admin@test.com',
  3
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    email = EXCLUDED.email,
    role_id = EXCLUDED.role_id;

COMMIT;
