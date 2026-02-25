import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { ClipboardList, Calendar, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { StudentResult } from '@/types/student';
import GradeBadge from '@/components/GradeBadge';
import { useAdmin } from '@/contexts/AdminContext'; // Use the live Context

export default function AdminResultsScreen() {
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Extract from the live Supabase query hook
    const { students, results } = useAdmin();

    const examFilters = useMemo(() => {
        const exams = new Set(results.map((r) => r.examName));
        return Array.from(exams);
    }, [results]);

    const filtered = useMemo(() => {
        if (!selectedExam) return results;
        return results.filter((r) => r.examName === selectedExam);
    }, [selectedExam, results]);

    const getStudentName = (studentId: string): string => {
        const student = students.find((s) => s.id === studentId);
        return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
    };

    const getStudentClass = (studentId: string): string => {
        const student = students.find((s) => s.id === studentId);
        return student ? `${student.className} - ${student.section}` : '';
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    const renderResult = ({ item }: { item: StudentResult }) => {
        const studentName = getStudentName(item.studentId);
        const studentClass = getStudentClass(item.studentId);
        const initials = studentName.split(' ').map((n) => n[0]).join('');

        return (
            <View style={styles.resultCard}>
                <View style={styles.resultTop}>
                    <View style={styles.resultStudentRow}>
                        <View style={styles.miniAvatar}>
                            <Text style={styles.miniAvatarText}>{initials}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultStudentName}>{studentName}</Text>
                            <Text style={styles.resultStudentClass}>{studentClass}</Text>
                        </View>
                    </View>
                    <View style={styles.gradeBadgeMinimal}>
                        <Text style={styles.gradeBadgeMinimalText}>{item.grade}</Text>
                    </View>
                </View>

                <View style={styles.resultMeta}>
                    <View style={styles.resultMetaItem}>
                        <ClipboardList size={14} color={Theme.colors.textTertiary} />
                        <Text style={styles.resultMetaText}>{item.examName}</Text>
                    </View>
                    <View style={styles.resultMetaItem}>
                        <Calendar size={14} color={Theme.colors.textTertiary} />
                        <Text style={styles.resultMetaText}>
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.resultStats}>
                    <View style={styles.resultStat}>
                        <Text style={styles.resultStatLabel}>Score</Text>
                        <Text style={styles.resultStatValue}>{item.totalMarks}/{item.totalMaxMarks}</Text>
                    </View>
                    <View style={styles.resultStatDivider} />
                    <View style={styles.resultStat}>
                        <Text style={styles.resultStatLabel}>Percentage</Text>
                        <Text style={[styles.resultStatValue, { color: Theme.colors.success }]}>{item.percentage}%</Text>
                    </View>
                    <View style={styles.resultStatDivider} />
                    <View style={styles.resultStat}>
                        <Text style={styles.resultStatLabel}>Subjects</Text>
                        <Text style={styles.resultStatValue}>{item.entries.length}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {examFilters.length > 0 && (
                <View style={styles.filtersContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedExam && styles.filterChipActive]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedExam(null);
                        }}
                    >
                        <Text style={[styles.filterChipText, !selectedExam && styles.filterChipTextActive]}>All</Text>
                    </TouchableOpacity>
                    {examFilters.map((exam) => (
                        <TouchableOpacity
                            key={exam}
                            style={[styles.filterChip, selectedExam === exam && styles.filterChipActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedExam(selectedExam === exam ? null : exam);
                            }}
                        >
                            <Text style={[styles.filterChipText, selectedExam === exam && styles.filterChipTextActive]}>
                                {exam}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{filtered.length}</Text>
                    <Text style={styles.summaryLabel}>Total Results</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={[styles.summaryValue, { color: Theme.colors.success }]}>
                        {filtered.length > 0
                            ? Math.round((filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length) * 10) / 10
                            : 0}%
                    </Text>
                    <Text style={styles.summaryLabel}>Avg Score</Text>
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderResult}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <ClipboardList size={40} color={Theme.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>No Results Found</Text>
                        <Text style={styles.emptySubtitle}>Results will appear here when published</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingVertical: Theme.spacing.sm,
        gap: 8,
        flexWrap: 'wrap',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Theme.layout.borderRadiusPill,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    filterChipActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    filterChipText: {
        ...Theme.typography.body,
        fontWeight: '500',
        color: Theme.colors.textSecondary,
    },
    filterChipTextActive: {
        color: Theme.colors.background,
    },
    summaryRow: {
        flexDirection: 'row',
        paddingHorizontal: Theme.layout.paddingHorizontal,
        gap: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        alignItems: 'center',
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    summaryValue: {
        ...Theme.typography.h2,
        fontSize: 24,
    },
    summaryLabel: {
        ...Theme.typography.caption,
        marginTop: 4,
    },
    list: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: 8,
        paddingBottom: Theme.spacing.xxxl,
    },
    resultCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    resultTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    resultStudentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    miniAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
    },
    miniAvatarText: {
        ...Theme.typography.h3,
        color: Theme.colors.background,
    },
    resultInfo: {
        flex: 1,
    },
    resultStudentName: {
        ...Theme.typography.bodyLarge,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    resultStudentClass: {
        ...Theme.typography.caption,
        marginTop: 2,
    },
    gradeBadgeMinimal: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradeBadgeMinimalText: {
        ...Theme.typography.h3,
        color: Theme.colors.background,
    },
    resultMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: Theme.spacing.md,
    },
    resultMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    resultMetaText: {
        ...Theme.typography.caption,
        fontWeight: '500',
    },
    resultStats: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.layout.borderRadiusIcon,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    resultStat: {
        flex: 1,
        alignItems: 'center',
    },
    resultStatLabel: {
        ...Theme.typography.caption,
    },
    resultStatValue: {
        ...Theme.typography.h3,
        marginTop: 2,
    },
    resultStatDivider: {
        width: 1,
        backgroundColor: Theme.colors.border,
        marginVertical: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        ...Theme.typography.h2,
        marginTop: Theme.spacing.md,
    },
    emptySubtitle: {
        ...Theme.typography.body,
        marginTop: Theme.spacing.sm,
    },
});
