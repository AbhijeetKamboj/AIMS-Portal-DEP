-- Run this in your Supabase SQL Editor

-- 1. Meeting Requests Table (Matches backend code)
create table if not exists meeting_requests (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references auth.users(id) not null,
  faculty_id uuid references auth.users(id) not null,
  reason text not null,
  requested_date date, -- Code separates date/time
  requested_time time, 
  status text check (status in ('pending', 'approved', 'rejected', 'completed')) default 'pending',
  response text,
  created_at timestamp with time zone default now()
);

-- 2. Announcements Table
create table if not exists announcements (
  id uuid default uuid_generate_v4() primary key,
  offering_id uuid references course_offerings(id) on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- 3. Course Materials Table
create table if not exists course_materials (
  id uuid default uuid_generate_v4() primary key,
  offering_id uuid references course_offerings(id) on delete cascade not null,
  title text not null,
  file_url text not null, -- Assuming URL to file storage
  uploaded_at timestamp with time zone default now()
);

-- 4. Enable RLS 
alter table meeting_requests enable row level security;
alter table announcements enable row level security;
alter table course_materials enable row level security;

-- Policies 
create policy "Users can view their own meeting requests" on meeting_requests
  for select using (auth.uid() = student_id or auth.uid() = faculty_id);

create policy "Student can insert meeting requests" on meeting_requests
  for insert with check (auth.uid() = student_id);

create policy "Faculty can update their meeting requests" on meeting_requests
  for update using (auth.uid() = faculty_id);

create policy "Public read announcements" on announcements
  for select using (true); 

create policy "Faculty insert announcements" on announcements
  for insert with check (
      exists (
          select 1 from course_offerings
          where id = offering_id and faculty_id = auth.uid()
      )
  );

create policy "Public read materials" on course_materials
  for select using (true);


-- 5. Grades Table Updates (Approval Workflow)
alter table grades 
add column if not exists status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
add column if not exists submitted_at timestamp with time zone default now(),
add column if not exists approved_at timestamp with time zone;

-- 6. Course Offerings Updates (Slot)
alter table course_offerings
add column if not exists slot text;

-- 7. Policy for Grades (Faculty view own, Admin view all)
-- (Existing policies might cover this, but ensuring Faculty can insert/select their offerings' grades)

