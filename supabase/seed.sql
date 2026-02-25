-- Sample Mock Seed Data for Supabase

-- Note: Because Supabase users (auth.users) must be created using the Supabase Authentication APIs,
-- we do not insert profiles or students directly tied to `profile_id` here yet. 
-- For the sake of the demo, we will insert them with NULL profile_ids, OR we can let the application 
-- insert them upon signup. 

-- If you want to populate your database with dummy data BEFORE connecting your Authentication:
-- (Run this script in the Supabase SQL Editor AFTER running schema.sql)

INSERT INTO public.students (first_name, last_name, roll_number, class_name, section, date_of_birth, gender, email, guardian_name, address)
VALUES 
  ('Aarav', 'Sharma', '2024CS01', 'TYBSC CS', 'A', '2008-05-15', 'Male', 'aarav.sharma@example.com', 'Rajesh Sharma', 'Sector 14, Noida'),
  ('Diya', 'Patel', '2024CS02', 'TYBSC CS', 'A', '2008-08-22', 'Female', 'diya.patel@example.com', 'Amit Patel', 'Andheri West, Mumbai'),
  ('Aditya', 'Verma', '2024CS03', 'TYBSC CS', 'B', '2008-01-10', 'Male', 'aditya.verma@example.com', 'Vikram Verma', 'Koramangala, Bangalore'),
  ('Neha', 'Gupta', '2024CS04', 'SYBSC CS', 'A', '2009-02-14', 'Female', 'neha.gupta@example.com', 'Suresh Gupta', 'Vashi, Navi Mumbai'),
  ('Rahul', 'Desai', '2024CS05', 'FYBSC CS', 'B', '2010-06-20', 'Male', 'rahul.desai@example.com', 'Ramesh Desai', 'Thane West, Mumbai'),
  ('Simran', 'Kaur', '2024BC01', 'TYBCOM', 'A', '2008-03-30', 'Female', 'simran.kaur@example.com', 'Manjit Singh', 'Bandra East, Mumbai'),
  ('Kevin', 'DSouza', '2024BC02', 'SYBCOM', 'B', '2009-12-05', 'Male', 'kevin.dsouza@example.com', 'Paul DSouza', 'Malad West, Mumbai'),
  ('Pooja', 'Iyer', '2024BA01', 'FYBA', 'A', '2010-09-11', 'Female', 'pooja.iyer@example.com', 'Shankar Iyer', 'Chembur, Mumbai');

-- Insert pseudo Results (Note: To keep this script generic, we will fetch the generated UUIDs from students)
-- Run these individually if they cause issues:
DO $$ 
DECLARE
  aarav_id UUID;
  diya_id UUID;
BEGIN
  SELECT id INTO aarav_id FROM public.students WHERE email = 'aarav.sharma@example.com';
  SELECT id INTO diya_id FROM public.students WHERE email = 'diya.patel@example.com';

  INSERT INTO public.results (student_id, exam_name, total_marks, total_max_marks, percentage, grade, entries)
  VALUES 
  (aarav_id, 'Mid-Term Exam', 425, 500, 85.00, 'A', '[{"subjectId": "1", "subjectName": "Mathematics", "marksObtained": 85, "maxMarks": 100}, {"subjectId": "2", "subjectName": "Science", "marksObtained": 88, "maxMarks": 100}]'::jsonb),
  (aarav_id, 'Final Exam', 460, 500, 92.00, 'nA+', '[{"subjectId": "1", "subjectName": "Mathematics", "marksObtained": 95, "maxMarks": 100}, {"subjectId": "2", "subjectName": "Science", "marksObtained": 90, "maxMarks": 100}]'::jsonb),
  (diya_id, 'Mid-Term Exam', 390, 500, 78.00, 'B+', '[{"subjectId": "1", "subjectName": "Mathematics", "marksObtained": 75, "maxMarks": 100}, {"subjectId": "2", "subjectName": "Science", "marksObtained": 82, "maxMarks": 100}]'::jsonb);

  INSERT INTO public.attendance (student_id, total_days, present_days, absent_days, late_days, percentage)
  VALUES
  (aarav_id, 180, 168, 12, 4, 93.33),
  (diya_id, 180, 175, 5, 2, 97.22);
END $$;

INSERT INTO public.exams (name, exam_date, subject)
VALUES
  ('Unit Test 1 - Maths', '2024-03-15', 'Mathematics'),
  ('Pre-Board Science', '2024-04-02', 'Science');

INSERT INTO public.announcements (title, description, announcement_date, type)
VALUES
  ('Science Fair Registration', 'Register for the upcoming science fair before Friday.', '2024-02-28', 'event'),
  ('Mid-Term Results Published', 'All students can now check their Mid-Term results.', '2024-02-20', 'result');
