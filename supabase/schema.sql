-- Supabase Schema for Diksha Application

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    class_name TEXT NOT NULL,
    section TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    exam_name TEXT NOT NULL,
    entries JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ResultEntry: [{subjectId, subjectName, marksObtained, maxMarks}]
    total_marks INTEGER NOT NULL,
    total_max_marks INTEGER NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    grade TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE PRIMARY KEY,
    total_days INTEGER NOT NULL DEFAULT 0,
    present_days INTEGER NOT NULL DEFAULT 0,
    absent_days INTEGER NOT NULL DEFAULT 0,
    late_days INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    class_assigned TEXT NOT NULL,
    section_assigned TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    announcement_date DATE NOT NULL,
    type TEXT CHECK (type IN ('event', 'result', 'notice')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Configure Row Level Security (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 3. Create basic policies (Allow public reads for easy prototyping without strict Supabase Auth wired)
-- Note: Replace these with more secure restrictive rules once prototype passes phase 1.

-- Profiles: Users can read their own profile, Admins can read all.
CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Students: Everyone authenticated can view for now.
CREATE POLICY "Students are viewable by all" ON public.students FOR SELECT USING (true);

-- Results: Students can view their own, Admins can view all.
CREATE POLICY "Results viewable by all" ON public.results FOR SELECT USING (true);

-- Attendance: Viewable by authenticated
CREATE POLICY "Attendance viewable by all" ON public.attendance FOR SELECT USING (true);

-- Exams: Viewable by authenticated
CREATE POLICY "Exams viewable by all" ON public.exams FOR SELECT USING (true);

-- Announcements: Viewable by authenticated
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);

-- 4. Set up Trigger for auto-timestamping
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_modtime BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
