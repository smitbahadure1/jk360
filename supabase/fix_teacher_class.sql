-- Fix the Teacher Class Assignment in the Database --

-- 1. Update existing teacher records to point to the new class
UPDATE public.teachers 
SET class_assigned = 'BSC.CS-TY' 
WHERE class_assigned = 'Class 10';

-- 2. If you are testing with the Admin account as a Teacher and no record exists, 
-- proper testing requires a teacher entry. This inserts one if missing for your admin ID.
-- (This uses a subquery to find your admin ID based on email, just to be safe)
INSERT INTO public.teachers (profile_id, class_assigned, section_assigned)
SELECT id, 'BSC.CS-TY', 'A'
FROM public.profiles
WHERE email = 'gawadediksha020@gmail.com'
ON CONFLICT (profile_id) DO UPDATE 
SET class_assigned = 'BSC.CS-TY', section_assigned = 'A';

-- 3. Verify the changes
SELECT * FROM public.teachers;
