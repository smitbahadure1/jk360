-- 1. Create the new Teacher and Attendance tables
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

-- Note: We must update the check constraint on profiles to allow 'teacher'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin'));

-- 2. Insert Master User (Bypassing Email Verification)
DO $$
DECLARE
    new_user_id UUID;
    v_email text := 'gawadediksha020@gmail.com';
    v_password text := '12345huggi';
BEGIN
    -- Check if user exists
    SELECT id INTO new_user_id FROM auth.users WHERE email = v_email;

    IF new_user_id IS NULL THEN
        -- Insert into auth.users (using crypt for password hashing)
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', 
            new_user_id, 
            'authenticated', 
            'authenticated', 
            v_email, 
            crypt(v_password, gen_salt('bf')), 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            '{}', 
            now(), 
            now(), 
            '', '', '', ''
        );
    ELSE
        -- If user exists but couldn't verify, force verify and update password
        UPDATE auth.users 
        SET email_confirmed_at = now(),
            encrypted_password = crypt(v_password, gen_salt('bf'))
        WHERE id = new_user_id;
    END IF;

    -- 3. Ensure they have an Admin Profile
    INSERT INTO public.profiles (id, role, first_name, last_name)
    VALUES (new_user_id, 'admin', 'Diksha', 'Admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';

    -- 4. Map the Admin to the Teacher table so they can test Teacher UI
    INSERT INTO public.teachers (profile_id, class_assigned, section_assigned)
    VALUES (new_user_id, 'Class 10', 'A')
    ON CONFLICT (profile_id) DO UPDATE SET class_assigned = 'Class 10', section_assigned = 'A';

END $$;
