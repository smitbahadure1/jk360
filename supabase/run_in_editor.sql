-- 1. FIX PERMISSIONS (So you can add/edit students from the app/admin panel) --
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
CREATE POLICY "Enable insert for authenticated users only" ON public.students FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.students;
CREATE POLICY "Enable update for authenticated users only" ON public.students FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.students;
CREATE POLICY "Enable delete for authenticated users only" ON public.students FOR DELETE TO authenticated USING (true);


-- 2. CLEAR OLD MOCK DATA --
DELETE FROM public.results;
DELETE FROM public.attendance;
DELETE FROM public.students;

-- 3. INSERT YOUR REAL STUDENTS (BSC.CS-TY) --
INSERT INTO public.students (roll_number, first_name, last_name, class_name, section, email, gender, date_of_birth, guardian_name)
VALUES
('2025012010', 'SIDDHI', 'DHAMAL', 'BSC.CS-TY', 'A', '2025012010@jkcollege.edu', 'Female', '2004-01-01', 'SANJAY SARIKA'),
('2025012013', 'SUMIT KUMAR', 'DUBEY', 'BSC.CS-TY', 'A', '2025012013@jkcollege.edu', 'Male', '2004-01-01', 'DILIP KUMAR PADMA'),
('2025012014', 'KRISHNA', 'GAUTAM', 'BSC.CS-TY', 'A', '2025012014@jkcollege.edu', 'Male', '2004-01-01', 'PAPPU POONAM'),
('2025012017', 'VIRENDRA KUMAR', 'GOUND', 'BSC.CS-TY', 'A', '2025012017@jkcollege.edu', 'Male', '2004-01-01', 'VIJAY SATBINDAR'),
('2025012018', 'OM', 'GUPTA', 'BSC.CS-TY', 'A', '2025012018@jkcollege.edu', 'Male', '2004-01-01', 'JITENDRA SANGEETA'),
('2025012020', 'KARTIK', 'GURAV', 'BSC.CS-TY', 'A', '2025012020@jkcollege.edu', 'Male', '2004-01-01', 'PRAKASH CHANDRAKALA'),
('2025012022', 'HARSHAL', 'HATLE', 'BSC.CS-TY', 'A', '2025012022@jkcollege.edu', 'Male', '2004-01-01', 'DILIP DIPIKA'),
('2025012025', 'SHUBHAM', 'KADAM', 'BSC.CS-TY', 'A', '2025012025@jkcollege.edu', 'Male', '2004-01-01', 'CHANDRAKANT LEELA'),
('2025012029', 'SOHAM', 'KARANGUTKAR', 'BSC.CS-TY', 'A', '2025012029@jkcollege.edu', 'Male', '2004-01-01', 'PRAVIN PRERNA'),
('2025012031', 'SURAJ', 'KHAW', 'BSC.CS-TY', 'A', '2025012031@jkcollege.edu', 'Male', '2004-01-01', 'ANIL GUDIYA'),
('2025012032', 'LALIT', 'KUMAWAT', 'BSC.CS-TY', 'A', '2025012032@jkcollege.edu', 'Male', '2004-01-01', 'DUDARAM SANTOSHI'),
('2025012036', 'HARSH', 'PANDEY', 'BSC.CS-TY', 'A', '2025012036@jkcollege.edu', 'Male', '2004-01-01', 'BRAMHADEV KAVITA'),
('2025012041', 'SUJAL', 'PATIL', 'BSC.CS-TY', 'A', '2025012041@jkcollege.edu', 'Male', '2004-01-01', 'SURESH VARSHA'),
('2025012053', 'MANISH', 'SHELAR', 'BSC.CS-TY', 'A', '2025012053@jkcollege.edu', 'Male', '2004-01-01', 'DHONDIBA SARITA'),
('2025012057', 'MOHD RASHID', 'SIDDIQUE', 'BSC.CS-TY', 'A', '2025012057@jkcollege.edu', 'Male', '2004-01-01', 'MOHD NASTAIN AFSHARI KHATOON'),
('2025012058', 'AMIT', 'SINGH', 'BSC.CS-TY', 'A', '2025012058@jkcollege.edu', 'Male', '2004-01-01', 'RANDHIR MALA'),
('2025012059', 'DIVYANSHU', 'SINGH', 'BSC.CS-TY', 'A', '2025012059@jkcollege.edu', 'Male', '2004-01-01', 'DHANANJAY KAMALADEVI'),
('2025012061', 'BHARAT', 'SONI', 'BSC.CS-TY', 'A', '2025012061@jkcollege.edu', 'Male', '2004-01-01', 'RAMPRAKASH ANITA'),
('2025012064', 'KARAN', 'VISHWAKARMA', 'BSC.CS-TY', 'A', '2025012064@jkcollege.edu', 'Male', '2004-01-01', 'ASHOK GUNJAN'),
('2025012068', 'ABHISHEK', 'YADAV', 'BSC.CS-TY', 'A', '2025012068@jkcollege.edu', 'Male', '2004-01-01', 'KAMLESH RITA'),
('2025012070', 'ANSHIKA', 'YADAV', 'BSC.CS-TY', 'A', '2025012070@jkcollege.edu', 'Female', '2004-01-01', 'RAMESH VINDU'),
('2025012073', 'NEHA', 'JANRAO', 'BSC.CS-TY', 'A', '2025012073@jkcollege.edu', 'Female', '2004-01-01', 'ABHIMANYU DIPALI'),
('2025012074', 'ABHISHEK', 'YADAV', 'BSC.CS-TY', 'A', '2025012074@jkcollege.edu', 'Male', '2004-01-01', 'RAMSWARTH SARITA');
