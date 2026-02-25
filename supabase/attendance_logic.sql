-- Function to recalculate and update a student's total attendance stats
CREATE OR REPLACE FUNCTION update_student_attendance_aggregate()
RETURNS TRIGGER AS $$
DECLARE
    v_total_days INTEGER;
    v_present_days INTEGER;
    v_absent_days INTEGER;
    v_late_days INTEGER;
    v_percentage NUMERIC(5,2);
BEGIN
    -- Calculate totals from daily_attendance for the student
    SELECT 
        COUNT(*),
        COALESCE(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END), 0)
    INTO 
        v_total_days, v_present_days, v_absent_days, v_late_days
    FROM public.daily_attendance
    WHERE student_id = NEW.student_id;

    -- Calculate percentage (treat late as present for percentage, or specify accordingly)
    -- Typically, (Present + Late) / Total * 100
    IF v_total_days > 0 THEN
        v_percentage := ROUND(((v_present_days + v_late_days)::NUMERIC / v_total_days::NUMERIC) * 100, 2);
    ELSE
        v_percentage := 0;
    END IF;

    -- Upsert the result into the attendance table
    INSERT INTO public.attendance (student_id, total_days, present_days, absent_days, late_days, percentage, updated_at)
    VALUES (NEW.student_id, v_total_days, v_present_days, v_absent_days, v_late_days, v_percentage, NOW())
    ON CONFLICT (student_id) DO UPDATE SET
        total_days = EXCLUDED.total_days,
        present_days = EXCLUDED.present_days,
        absent_days = EXCLUDED.absent_days,
        late_days = EXCLUDED.late_days,
        percentage = EXCLUDED.percentage,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after any INSERT, UPDATE, or DELETE on daily_attendance
DROP TRIGGER IF EXISTS trigger_update_attendance_aggregate ON public.daily_attendance;
CREATE TRIGGER trigger_update_attendance_aggregate
AFTER INSERT OR UPDATE OR DELETE ON public.daily_attendance
FOR EACH ROW
EXECUTE PROCEDURE update_student_attendance_aggregate();

-- Allow teachers to actually insert and update daily attendance
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.daily_attendance;
CREATE POLICY "Enable insert for authenticated users only" ON public.daily_attendance FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.daily_attendance;
CREATE POLICY "Enable update for authenticated users only" ON public.daily_attendance FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.daily_attendance;
CREATE POLICY "Enable read for authenticated users only" ON public.daily_attendance FOR SELECT TO authenticated USING (true);
