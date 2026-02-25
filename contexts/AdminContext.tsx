import { useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Student, StudentResult } from '@/types/student';
import { ADMIN_PROFILE, ALL_STUDENTS, ALL_RESULTS, CLASS_STATS, ADMIN_ANNOUNCEMENTS } from '@/mocks/admin';
import { supabase } from '@/lib/supabase';

const ADMIN_INITIALIZED_KEY = 'admin_data_initialized';

export const [AdminProvider, useAdmin] = createContextHook(() => {
    const [students, setStudents] = useState<Student[]>(ALL_STUDENTS);
    const [results, setResults] = useState<StudentResult[]>(ALL_RESULTS);
    const [announcements, setAnnouncements] = useState<any[]>(ADMIN_ANNOUNCEMENTS);

    const [adminProfile, setAdminProfile] = useState<any>(ADMIN_PROFILE);

    const adminQuery = useQuery({
        queryKey: ['admin-data'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            let liveAdminProfile = ADMIN_PROFILE;

            if (session) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profile) {
                    liveAdminProfile = {
                        ...ADMIN_PROFILE,
                        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || ADMIN_PROFILE.name,
                        role: profile.role === 'admin' ? 'Principal' : 'Teacher'
                    };
                }
            }

            // 1. Fetch Students
            const studentsRes = await supabase.from('students').select('*');
            let liveStudents: Student[] = ALL_STUDENTS;
            if (!studentsRes.error && studentsRes.data && studentsRes.data.length > 0) {
                liveStudents = studentsRes.data.map(data => ({
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
                }));
            }

            // 2. Fetch Results
            const resultsRes = await supabase.from('results').select('*');
            let liveResults: StudentResult[] = ALL_RESULTS;
            if (!resultsRes.error && resultsRes.data && resultsRes.data.length > 0) {
                liveResults = resultsRes.data.map(d => ({
                    id: d.id,
                    studentId: d.student_id,
                    examName: d.exam_name,
                    entries: d.entries,
                    totalMarks: d.total_marks,
                    totalMaxMarks: d.total_max_marks,
                    percentage: parseFloat(d.percentage),
                    grade: d.grade,
                    createdAt: d.created_at,
                }));
            }

            // 3. Fetch announcements
            const annRes = await supabase.from('announcements').select('*');
            let liveAnnouncements = ADMIN_ANNOUNCEMENTS;
            if (!annRes.error && annRes.data && annRes.data.length > 0) {
                liveAnnouncements = annRes.data.map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    date: a.announcement_date,
                    type: a.type,
                    status: new Date(a.announcement_date) > new Date() ? 'upcoming' : 'completed',
                })) as any;
            }

            return {
                liveAdminProfile,
                liveStudents,
                liveResults,
                liveAnnouncements
            };
        },
    });

    useEffect(() => {
        if (adminQuery.data) {
            setAdminProfile(adminQuery.data.liveAdminProfile);
            setStudents(adminQuery.data.liveStudents);
            setResults(adminQuery.data.liveResults);
            setAnnouncements(adminQuery.data.liveAnnouncements);
        }
    }, [adminQuery.data]);

    const classStats = useMemo(() => {
        if (students.length === 0) return CLASS_STATS;
        const classGroups: Record<string, { sections: Set<string>, studentCount: number, totalPct: number, resultCount: number }> = {};

        students.forEach(s => {
            if (!classGroups[s.className]) {
                classGroups[s.className] = { sections: new Set(), studentCount: 0, totalPct: 0, resultCount: 0 };
            }
            classGroups[s.className].sections.add(s.section);
            classGroups[s.className].studentCount++;
        });

        results.forEach(r => {
            const student = students.find(s => s.id === r.studentId);
            if (student && classGroups[student.className]) {
                classGroups[student.className].totalPct += r.percentage;
                classGroups[student.className].resultCount++;
            }
        });

        return Object.entries(classGroups).map(([className, data]) => ({
            className,
            sections: Array.from(data.sections).sort(),
            studentCount: data.studentCount,
            avgPercentage: data.resultCount > 0 ? Math.round((data.totalPct / data.resultCount) * 10) / 10 : 0
        })).sort((a, b) => b.studentCount - a.studentCount);

    }, [students, results]);

    return {
        adminProfile,
        students,
        results,
        announcements,
        classStats,
        isLoading: adminQuery.isLoading,
    };
});
