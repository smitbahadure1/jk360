import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Check, X, Clock, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function TeacherAttendanceScreen() {
    const { students } = useAdmin();
    const { userId } = useAuth();

    const [assignedClass, setAssignedClass] = useState('');
    const [assignedSection, setAssignedSection] = useState('');
    const [loading, setLoading] = useState(true);
    const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTeacherContext();
    }, [userId]);

    const loadTeacherContext = async () => {
        setLoading(true);
        if (!userId) { setLoading(false); return; }

        // Get assignment
        const { data: assignment } = await supabase.from('teachers').select('*').eq('profile_id', userId).single();
        if (assignment) {
            setAssignedClass(assignment.class_assigned);
            setAssignedSection(assignment.section_assigned);

            // Get today's attendance if already marked
            const today = new Date().toISOString().split('T')[0];
            const { data: marked } = await supabase.from('daily_attendance')
                .select('*')
                .eq('date', today)
                .eq('marked_by', userId);

            if (marked && marked.length > 0) {
                const mapping: any = {};
                marked.forEach(m => { mapping[m.student_id] = m.status; });
                setAttendanceState(mapping);
            }
        }
        setLoading(false);
    };

    const classList = useMemo(() => {
        if (!assignedClass) return [];
        return students.filter(s => s.className === assignedClass && s.section === assignedSection)
            .sort((a, b) => a.firstName.localeCompare(b.firstName));
    }, [students, assignedClass, assignedSection]);

    const toggleStatus = (id: string, status: 'present' | 'absent' | 'late') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAttendanceState(prev => ({
            ...prev,
            [id]: prev[id] === status ? null : status
        }) as any);
    };

    const markAllPresent = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const mapping: any = { ...attendanceState };
        classList.forEach(s => {
            if (!mapping[s.id]) mapping[s.id] = 'present';
        });
        setAttendanceState(mapping);
    };

    const saveAttendance = async () => {
        const unmarked = classList.filter(s => !attendanceState[s.id]);
        if (unmarked.length > 0) {
            Alert.alert('Incomplete', `Please mark attendance for all students. ${unmarked.length} remaining.`);
            return;
        }

        setSaving(true);
        const today = new Date().toISOString().split('T')[0];
        const recordsToUpsert = classList.map(student => ({
            student_id: student.id,
            date: today,
            status: attendanceState[student.id],
            marked_by: userId
        }));

        // Upsert daily records
        const { error } = await supabase.from('daily_attendance').upsert(recordsToUpsert, { onConflict: 'student_id,date' });

        if (error) {
            Alert.alert('Error', 'Failed to save attendance logs: ' + error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Attendance saved for today.');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    if (!assignedClass) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <AlertCircle size={40} color={Theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Class Assigned</Text>
                <Text style={styles.emptySubtitle}>You aren't associated with a specific class in the portal yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Theme.spacing.xs }}>
                    <Text style={styles.title}>Attendance</Text>
                    {classList.length > 0 && classList.some(s => !attendanceState[s.id]) && (
                        <TouchableOpacity onPress={markAllPresent} style={{ paddingBottom: 6 }}>
                            <Text style={{ color: Theme.colors.primary, fontWeight: '600' }}>Mark All Present</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{assignedClass} - section {assignedSection}</Text>
                    <Text style={styles.metaTextDivider}>•</Text>
                    <Text style={styles.metaText}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                </View>
            </View>

            <FlatList
                data={classList}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const currentStatus = attendanceState[item.id]; // No longer defaults to present

                    return (
                        <View style={styles.studentCard}>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.studentRoll}>Roll #{item.rollNumber}</Text>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.statusBtn, currentStatus === 'present' && styles.statusBtnPresent]}
                                    onPress={() => toggleStatus(item.id, 'present')}
                                >
                                    <Check size={16} color={currentStatus === 'present' ? Theme.colors.background : Theme.colors.textTertiary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.statusBtn, currentStatus === 'absent' && styles.statusBtnAbsent]}
                                    onPress={() => toggleStatus(item.id, 'absent')}
                                >
                                    <X size={16} color={currentStatus === 'absent' ? Theme.colors.background : Theme.colors.textTertiary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.statusBtn, currentStatus === 'late' && styles.statusBtnLate]}
                                    onPress={() => toggleStatus(item.id, 'late')}
                                >
                                    <Clock size={16} color={currentStatus === 'late' ? Theme.colors.surface : Theme.colors.textTertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptySubtitle}>No students mapped to your class.</Text>
                    </View>
                )}
            />

            {classList.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={saveAttendance}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator color={Theme.colors.background} /> : <Text style={styles.saveBtnText}>Save Roster</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: Theme.spacing.xxxl + Theme.spacing.sm,
        paddingBottom: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    title: {
        ...Theme.typography.h1,
        marginBottom: Theme.spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        ...Theme.typography.bodyLarge,
        color: Theme.colors.textSecondary,
        fontWeight: '500',
    },
    metaTextDivider: {
        marginHorizontal: 8,
        color: Theme.colors.textTertiary,
    },
    list: {
        padding: Theme.layout.paddingHorizontal,
        paddingBottom: 100,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: Theme.spacing.sm,
        ...Theme.shadows.sm,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        ...Theme.typography.h3,
        marginBottom: 2,
    },
    studentRoll: {
        ...Theme.typography.caption,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 6,
    },
    statusBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.background,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    statusBtnPresent: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    statusBtnAbsent: {
        backgroundColor: Theme.colors.danger,
        borderColor: Theme.colors.danger,
    },
    statusBtnLate: {
        backgroundColor: Theme.colors.star,
        borderColor: Theme.colors.star,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Theme.layout.paddingHorizontal,
        paddingBottom: Theme.spacing.xxl,
        backgroundColor: Theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    saveBtn: {
        backgroundColor: Theme.colors.primary,
        height: 56,
        borderRadius: Theme.layout.borderRadiusPill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        ...Theme.typography.h3,
        color: Theme.colors.background,
    },
    emptyWrap: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyTitle: {
        ...Theme.typography.h2,
        marginTop: 20,
    },
    emptySubtitle: {
        ...Theme.typography.body,
        marginTop: 8,
        textAlign: 'center',
        color: Theme.colors.textSecondary,
    },
});
