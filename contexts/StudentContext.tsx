import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Student, StudentResult } from '@/types/student';
import { CURRENT_STUDENT, MOCK_RESULTS, ATTENDANCE_DATA, UPCOMING_EXAMS, ANNOUNCEMENTS } from '@/mocks/students';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const RESULTS_KEY = 'student_results_data';
const INITIALIZED_KEY = 'student_data_initialized';

export interface AttendanceData {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    percentage: number;
}

export interface UpcomingExam {
    id: string;
    name: string;
    date: string;
    subject: string;
}

export interface Announcement {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'event' | 'result' | 'notice';
}

export const [StudentProvider, useStudent] = createContextHook(() => {
    const { userId } = useAuth();
    const [results, setResults] = useState<StudentResult[]>([]);
    const [student, setStudent] = useState<Student>(CURRENT_STUDENT);
    const [attendance, setAttendance] = useState<AttendanceData>(ATTENDANCE_DATA);
    const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>(UPCOMING_EXAMS);
    const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);

    const studentQuery = useQuery({
        queryKey: ['student-profile', userId],
        queryFn: async () => {
            if (!userId) return CURRENT_STUDENT;

            // First, attempt to load live student data from Supabase for this specific user
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('profile_id', userId)
                .single();

            if (!error && data) {
                // Formulate to native interface
                return {
                    id: data.id,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    rollNumber: data.roll_number,
                    className: data.class_name,
                    section: data.section,
                    dateOfBirth: data.date_of_birth,
                    gender: data.gender,
                    email: data.email,
                    phone: data.phone,
                    guardianName: data.guardian_name,
                    guardianPhone: data.guardian_phone,
                    address: data.address,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                } as Student;
            }
            return CURRENT_STUDENT;
        },
        enabled: !!userId,
    });

    const resultsQuery = useQuery({
        queryKey: ['student-results', student.id],
        queryFn: async () => {
            if (student.id !== CURRENT_STUDENT.id) {
                // Fetch live results from Supabase if we pulled a live student
                const { data, error } = await supabase.from('results').select('*').eq('student_id', student.id);
                if (!error && data && data.length > 0) {
                    return data.map((d) => ({
                        id: d.id,
                        studentId: d.student_id,
                        examName: d.exam_name,
                        entries: d.entries,
                        totalMarks: d.total_marks,
                        totalMaxMarks: d.total_max_marks,
                        percentage: parseFloat(d.percentage),
                        grade: d.grade,
                        createdAt: d.created_at,
                    })) as StudentResult[];
                }
            }

            // Fallback to local memory mock setup if Supabase hasn't been configured by the admin yet
            const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
            if (!initialized) {
                await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(MOCK_RESULTS));
                await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
                return MOCK_RESULTS;
            }
            const stored = await AsyncStorage.getItem(RESULTS_KEY);
            return stored ? JSON.parse(stored) as StudentResult[] : [];
        },
        enabled: !!student.id,
    });

    const metaQuery = useQuery({
        queryKey: ['student-metadata', student.id],
        queryFn: async () => {
            if (student.id !== CURRENT_STUDENT.id) {
                // Gather the attendance, exams, and announcements via Supabase concurrent fetching
                const [attRes, examsRes, annRes] = await Promise.all([
                    supabase.from('attendance').select('*').eq('student_id', student.id).single(),
                    supabase.from('exams').select('*'),
                    supabase.from('announcements').select('*')
                ]);

                return {
                    liveAttendance: attRes.data ? {
                        totalDays: attRes.data.total_days,
                        presentDays: attRes.data.present_days,
                        absentDays: attRes.data.absent_days,
                        lateDays: attRes.data.late_days,
                        percentage: parseFloat(attRes.data.percentage)
                    } : ATTENDANCE_DATA,
                    liveExams: examsRes.data ? examsRes.data.map((e) => ({
                        id: e.id, name: e.name, date: e.exam_date, subject: e.subject
                    })) : UPCOMING_EXAMS,
                    liveAnnouncements: annRes.data ? annRes.data.map((a) => ({
                        id: a.id, title: a.title, description: a.description, date: a.announcement_date, type: a.type
                    })) : ANNOUNCEMENTS
                };
            }
            return { liveAttendance: ATTENDANCE_DATA, liveExams: UPCOMING_EXAMS, liveAnnouncements: ANNOUNCEMENTS };
        },
        enabled: !!student.id,
    });

    useEffect(() => {
        if (studentQuery.data) {
            setStudent(studentQuery.data);
        }
    }, [studentQuery.data]);

    useEffect(() => {
        if (resultsQuery.data) {
            setResults(resultsQuery.data);
        }
    }, [resultsQuery.data]);

    useEffect(() => {
        if (metaQuery.data) {
            setAttendance(metaQuery.data.liveAttendance);
            setUpcomingExams(metaQuery.data.liveExams);
            setAnnouncements(metaQuery.data.liveAnnouncements);
        }
    }, [metaQuery.data]);

    const getResultById = useCallback((id: string) => {
        return results.find((r) => r.id === id);
    }, [results]);

    const sortedResults = useMemo(() => {
        return [...results].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [results]);

    const latestResult = useMemo(() => {
        return sortedResults.length > 0 ? sortedResults[0] : null;
    }, [sortedResults]);

    const overallStats = useMemo(() => {
        if (results.length === 0) {
            return { avgPercentage: 0, bestPercentage: 0, totalExams: 0, bestGrade: '-' };
        }
        const avg = Math.round(
            (results.reduce((s, r) => s + r.percentage, 0) / results.length) * 10
        ) / 10;
        const best = results.reduce((max, r) => (r.percentage > max.percentage ? r : max), results[0]);
        return {
            avgPercentage: avg,
            bestPercentage: best.percentage,
            totalExams: results.length,
            bestGrade: best.grade,
        };
    }, [results]);

    const subjectAverages = useMemo(() => {
        const subjectMap: Record<string, { total: number; count: number; scores: number[] }> = {};
        results.forEach((r) => {
            r.entries.forEach((e) => {
                if (!subjectMap[e.subjectName]) {
                    subjectMap[e.subjectName] = { total: 0, count: 0, scores: [] };
                }
                const pct = (e.marksObtained / e.maxMarks) * 100;
                subjectMap[e.subjectName].total += pct;
                subjectMap[e.subjectName].count += 1;
                subjectMap[e.subjectName].scores.push(pct);
            });
        });
        return Object.entries(subjectMap)
            .map(([name, data]) => ({
                name,
                average: Math.round(data.total / data.count * 10) / 10,
                scores: data.scores,
            }))
            .sort((a, b) => b.average - a.average);
    }, [results]);

    const performanceTrend = useMemo(() => {
        return [...results]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((r) => ({
                examName: r.examName,
                percentage: r.percentage,
                grade: r.grade,
            }));
    }, [results]);

    return {
        student,
        results: sortedResults,
        attendance,
        upcomingExams,
        announcements,
        isLoading: resultsQuery.isLoading,
        getResultById,
        latestResult,
        overallStats,
        subjectAverages,
        performanceTrend,
    };
});
