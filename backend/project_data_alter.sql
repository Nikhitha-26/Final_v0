-- Run this SQL in the Supabase SQL editor to add missing columns to the existing project_data table
alter table project_data add column if not exists student_name text;
alter table project_data add column if not exists student_id text;
alter table project_data add column if not exists project_title text;
alter table project_data add column if not exists abstract text;
alter table project_data add column if not exists file_url text;
alter table project_data add column if not exists uploaded_by uuid references auth.users(id);
alter table project_data add column if not exists created_at timestamp with time zone default now();
