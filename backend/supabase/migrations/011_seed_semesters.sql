INSERT INTO semesters (name, start_date, end_date) 
VALUES 
('2025-I', '2025-01-01', '2025-05-30'),
('2025-II', '2025-08-01', '2025-12-30')
ON CONFLICT DO NOTHING;
