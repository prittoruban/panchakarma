-- AyurSutra Database Schema
-- Execute this in your Supabase SQL Editor

-- Create tables
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('admin','doctor','patient')),
  full_name text,
  phone text,
  center_id int,
  created_at timestamptz default now()
);

create table centers (
  id serial primary key,
  name text not null,
  address text,
  contact_email text
);

create table therapies (
  id serial primary key,
  name text not null,
  duration_days int,
  description text
);

create table therapy_sessions (
  id serial primary key,
  patient_id uuid references profiles(id) on delete cascade,
  doctor_id uuid references profiles(id),
  therapy_id int references therapies(id),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

create table feedbacks (
  id serial primary key,
  session_id int references therapy_sessions(id) on delete cascade,
  patient_id uuid references profiles(id),
  rating int check (rating >= 1 and rating <=5),
  symptoms text,
  improvement_notes text,
  created_at timestamptz default now()
);

create table notifications (
  id serial primary key,
  user_id uuid references profiles(id),
  channel text check (channel in ('inapp','email')) default 'inapp',
  title text,
  message text,
  is_read boolean default false,
  send_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table centers enable row level security;
alter table therapies enable row level security;
alter table therapy_sessions enable row level security;
alter table feedbacks enable row level security;
alter table notifications enable row level security;

-- RLS Policies

-- Profiles: Users can view their own profile, admins can view all
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admins can view all profiles" on profiles
  for select using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can manage all profiles" on profiles
  for all using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Centers: Admins can manage, others can view
create policy "Anyone can view centers" on centers
  for select using (true);

create policy "Admins can manage centers" on centers
  for all using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Therapies: Admins can manage, others can view
create policy "Anyone can view therapies" on therapies
  for select using (true);

create policy "Admins can manage therapies" on therapies
  for all using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Therapy Sessions: Patients see their own, doctors see assigned, admins see all
create policy "Patients can view own sessions" on therapy_sessions
  for select using (patient_id = auth.uid());

create policy "Doctors can view assigned sessions" on therapy_sessions
  for select using (doctor_id = auth.uid());

create policy "Admins can view all sessions" on therapy_sessions
  for select using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Patients can create sessions" on therapy_sessions
  for insert with check (patient_id = auth.uid());

create policy "Doctors can update assigned sessions" on therapy_sessions
  for update using (doctor_id = auth.uid());

create policy "Admins can manage all sessions" on therapy_sessions
  for all using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Feedbacks: Patients can create/view their own, doctors can view for their sessions, admins see all
create policy "Patients can manage own feedback" on feedbacks
  for all using (patient_id = auth.uid());

create policy "Doctors can view feedback for their sessions" on feedbacks
  for select using (
    exists(
      select 1 from therapy_sessions 
      where id = session_id and doctor_id = auth.uid()
    )
  );

create policy "Admins can view all feedback" on feedbacks
  for select using (
    exists(
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Notifications: Users can view their own
create policy "Users can view own notifications" on notifications
  for select using (user_id = auth.uid());

create policy "Users can update own notifications" on notifications
  for update using (user_id = auth.uid());

create policy "System can create notifications" on notifications
  for insert with check (true);

-- Insert sample data

-- Centers
insert into centers (name, address, contact_email) values
  ('AyurSutra Main Center', '123 Wellness St, Health City', 'main@ayursutra.com'),
  ('AyurSutra North Branch', '456 Therapy Ave, Healing Town', 'north@ayursutra.com');

-- Therapies
insert into therapies (name, duration_days, description) values
  ('Panchakarma Detox', 21, 'Complete detoxification and rejuvenation therapy'),
  ('Abhyanga Massage', 1, 'Full body oil massage with herbal oils'),
  ('Shirodhara', 1, 'Continuous pouring of medicated oil on forehead'),
  ('Swedana', 1, 'Herbal steam therapy for detoxification'),
  ('Nasya', 7, 'Nasal administration of medicated oils'),
  ('Virechana', 3, 'Therapeutic purgation for detoxification');

-- Note: Demo users need to be created in Supabase Auth first, then add to profiles table
-- After creating auth users, insert into profiles:
-- insert into profiles (id, role, full_name, phone, center_id) values
--   ('user-id-from-auth', 'admin', 'Admin User', '+1234567890', 1),
--   ('user-id-from-auth', 'doctor', 'Dr. Smith', '+1234567891', 1),
--   ('user-id-from-auth', 'patient', 'John Doe', '+1234567892', 1);

-- Sample notifications (will be created automatically by the app)
-- These are just examples of the types of notifications the system creates
