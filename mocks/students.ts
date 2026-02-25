import { Student, StudentResult } from '@/types/student';

export const CURRENT_STUDENT: Student = {
    id: '1',
    firstName: 'SMIT',
    lastName: 'BAHADURE',
    rollNumber: '2025012003',
    className: 'BSC.CS-TY',
    section: 'A',
    dateOfBirth: '2004-01-01',
    gender: 'Male',
    email: '2025012003@jkcollege.edu',
    phone: '+91 00000 00000',
    guardianName: 'BHASKAR BAHADURE',
    guardianPhone: '+91 00000 00000',
    address: 'JK College, Navi Mumbai',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
};

export const MOCK_STUDENTS: Student[] = [
    CURRENT_STUDENT,
    {
        id: '2',
        firstName: 'Priya',
        lastName: 'Patel',
        rollNumber: '2024002',
        className: 'BSC.CS-TY',
        section: 'A',
        dateOfBirth: '2008-08-22',
        gender: 'Female',
        email: 'priya.patel@school.edu',
        phone: '+91 98765 43212',
        guardianName: 'Sunil Patel',
        guardianPhone: '+91 98765 43213',
        address: '45 Green Street, Mumbai',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
    },
];

export const MOCK_RESULTS: StudentResult[] = [
    {
        id: 'r1',
        studentId: '1',
        examName: 'Unit Test 1',
        entries: [
            { subjectId: '1', subjectName: 'Artificial Intelligence', marksObtained: 82, maxMarks: 100 },
            { subjectId: '2', subjectName: 'Software Testing & QA', marksObtained: 78, maxMarks: 100 },
            { subjectId: '3', subjectName: 'Information Security', marksObtained: 88, maxMarks: 100 },
            { subjectId: '4', subjectName: 'Web Services', marksObtained: 72, maxMarks: 100 },
            { subjectId: '5', subjectName: 'Cloud Computing', marksObtained: 75, maxMarks: 100 },
        ],
        totalMarks: 395,
        totalMaxMarks: 500,
        percentage: 79,
        grade: 'B+',
        createdAt: '2024-02-15T10:00:00Z',
    },
    {
        id: 'r2',
        studentId: '1',
        examName: 'Mid-Term Exam',
        entries: [
            { subjectId: '1', subjectName: 'Artificial Intelligence', marksObtained: 92, maxMarks: 100 },
            { subjectId: '2', subjectName: 'Software Testing & QA', marksObtained: 88, maxMarks: 100 },
            { subjectId: '3', subjectName: 'Information Security', marksObtained: 85, maxMarks: 100 },
            { subjectId: '4', subjectName: 'Web Services', marksObtained: 78, maxMarks: 100 },
            { subjectId: '5', subjectName: 'Cloud Computing', marksObtained: 82, maxMarks: 100 },
        ],
        totalMarks: 425,
        totalMaxMarks: 500,
        percentage: 85,
        grade: 'A',
        createdAt: '2024-03-15T10:00:00Z',
    },
    {
        id: 'r3',
        studentId: '1',
        examName: 'Unit Test 2',
        entries: [
            { subjectId: '1', subjectName: 'Mathematics', marksObtained: 95, maxMarks: 100 },
            { subjectId: '2', subjectName: 'Science', marksObtained: 90, maxMarks: 100 },
            { subjectId: '3', subjectName: 'English', marksObtained: 91, maxMarks: 100 },
            { subjectId: '4', subjectName: 'History', marksObtained: 84, maxMarks: 100 },
            { subjectId: '5', subjectName: 'Geography', marksObtained: 87, maxMarks: 100 },
        ],
        totalMarks: 447,
        totalMaxMarks: 500,
        percentage: 89.4,
        grade: 'A',
        createdAt: '2024-05-10T10:00:00Z',
    },
    {
        id: 'r4',
        studentId: '1',
        examName: 'Pre-Board',
        entries: [
            { subjectId: '1', subjectName: 'Mathematics', marksObtained: 88, maxMarks: 100 },
            { subjectId: '2', subjectName: 'Science', marksObtained: 92, maxMarks: 100 },
            { subjectId: '3', subjectName: 'English', marksObtained: 94, maxMarks: 100 },
            { subjectId: '4', subjectName: 'History', marksObtained: 86, maxMarks: 100 },
            { subjectId: '5', subjectName: 'Geography', marksObtained: 90, maxMarks: 100 },
        ],
        totalMarks: 450,
        totalMaxMarks: 500,
        percentage: 90,
        grade: 'A+',
        createdAt: '2024-08-20T10:00:00Z',
    },
    {
        id: 'r5',
        studentId: '1',
        examName: 'Final Exam',
        entries: [
            { subjectId: '1', subjectName: 'Mathematics', marksObtained: 96, maxMarks: 100 },
            { subjectId: '2', subjectName: 'Science', marksObtained: 93, maxMarks: 100 },
            { subjectId: '3', subjectName: 'English', marksObtained: 90, maxMarks: 100 },
            { subjectId: '4', subjectName: 'History', marksObtained: 88, maxMarks: 100 },
            { subjectId: '5', subjectName: 'Geography', marksObtained: 91, maxMarks: 100 },
        ],
        totalMarks: 458,
        totalMaxMarks: 500,
        percentage: 91.6,
        grade: 'A+',
        createdAt: '2024-11-15T10:00:00Z',
    },
];

export const UPCOMING_EXAMS = [
    { id: 'e1', name: 'Unit Test 1', date: '2026-03-10', subject: 'Artificial Intelligence' },
    { id: 'e2', name: 'Unit Test 1', date: '2026-03-12', subject: 'Software Testing & QA' },
    { id: 'e3', name: 'Unit Test 1', date: '2026-03-14', subject: 'Cloud Computing' },
];

export const ATTENDANCE_DATA = {
    totalDays: 220,
    presentDays: 205,
    absentDays: 10,
    lateDays: 5,
    percentage: 93.2,
};

export const ANNOUNCEMENTS = [
    { id: 'a1', title: 'Annual Sports Day', description: 'Sports day will be held on March 20th. All students must participate.', date: '2026-03-20', type: 'event' as const },
    { id: 'a2', title: 'Mid-Term Results Published', description: 'Check your mid-term exam results in the Results tab.', date: '2026-02-22', type: 'result' as const },
    { id: 'a3', title: 'Holiday Notice', description: 'School will remain closed on March 1st for Holi celebrations.', date: '2026-03-01', type: 'notice' as const },
];
