-- Just ensure students have valid department codes
-- Don't try to insert departments - they already exist
UPDATE students SET department = 'CSE' WHERE department IS NULL OR department = '';
