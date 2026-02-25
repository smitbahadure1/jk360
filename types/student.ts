export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  className: string;
  section: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  maxMarks: number;
}

export interface ResultEntry {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  examName: string;
  entries: ResultEntry[];
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  createdAt: string;
}

export interface ClassInfo {
  name: string;
  sections: string[];
  studentCount: number;
}

export type GradeType = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

export function calculateGrade(percentage: number): GradeType {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return '#10B981';
    case 'B+':
    case 'B':
      return '#3B82F6';
    case 'C+':
    case 'C':
      return '#F59E0B';
    case 'D':
      return '#F97316';
    case 'F':
      return '#EF4444';
    default:
      return '#64748B';
  }
}

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', maxMarks: 100 },
  { id: '2', name: 'Science', maxMarks: 100 },
  { id: '3', name: 'English', maxMarks: 100 },
  { id: '4', name: 'History', maxMarks: 100 },
  { id: '5', name: 'Geography', maxMarks: 100 },
];

export const CLASS_OPTIONS = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
];

export const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

export const EXAM_OPTIONS = [
  'Mid-Term Exam',
  'Final Exam',
  'Unit Test 1',
  'Unit Test 2',
  'Pre-Board',
];
