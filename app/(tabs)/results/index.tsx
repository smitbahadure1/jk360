import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardList, ChevronRight, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import GradeBadge from '@/components/GradeBadge';
import EmptyState from '@/components/EmptyState';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ResultsListScreen() {
    const router = useRouter();
    const { results } = useStudent();
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const examFilters = useMemo(() => {
        const exams = new Set(results.map((r) => r.examName));
        return Array.from(exams);
    }, [results]);

    const filtered = useMemo(() => {
        if (!selectedExam) return results;
        return results.filter((r) => r.examName === selectedExam);
    }, [results, selectedExam]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    return (
        <View style={styles.container}>
            {examFilters.length > 0 && (
                <View style={styles.filtersContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedExam && styles.filterChipActive]}
                        onPress={() => setSelectedExam(null)}
                    >
                        <Text style={[styles.filterChipText, !selectedExam && styles.filterChipTextActive]}>
                            All
                        </Text>
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

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.resultCard}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push(`/results/${item.id}` as any);
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.resultTop}>
                            <View style={styles.resultInfo}>
                                <Text style={styles.resultExam}>{item.examName}</Text>
                                <View style={styles.resultDateRow}>
                                    <Calendar size={12} color={Theme.colors.textTertiary} />
                                    <Text style={styles.resultDate}>{formatDate(item.createdAt)}</Text>
                                </View>
                            </View>
                            <View style={styles.gradeBadgeMinimal}>
                                <Text style={styles.gradeBadgeMinimalText}>{item.grade}</Text>
                            </View>
                        </View>

                        <View style={styles.resultBottom}>
                            <View style={styles.resultStat}>
                                <Text style={styles.resultStatLabel}>Score</Text>
                                <Text style={styles.resultStatValue}>{item.totalMarks}/{item.totalMaxMarks}</Text>
                            </View>
                            <View style={styles.resultStatDivider} />
                            <View style={styles.resultStat}>
                                <Text style={styles.resultStatLabel}>Percentage</Text>
                                <Text style={[styles.resultStatValue, { color: Theme.colors.primary }]}>{item.percentage}%</Text>
                            </View>
                            <View style={styles.resultStatDivider} />
                            <View style={styles.resultStat}>
                                <Text style={styles.resultStatLabel}>Subjects</Text>
                                <Text style={styles.resultStatValue}>{item.entries.length}</Text>
                            </View>
                        </View>

                        <View style={styles.subjectPreview}>
                            {item.entries.slice(0, 3).map((entry) => {
                                const pct = entry.maxMarks > 0 ? (entry.marksObtained / entry.maxMarks) * 100 : 0;
                                return (
                                    <View key={entry.subjectId} style={styles.subjectMini}>
                                        <Text style={styles.subjectMiniName} numberOfLines={1}>{entry.subjectName}</Text>
                                        <View style={styles.subjectMiniBarBg}>
                                            <View style={[
                                                styles.subjectMiniBarFill,
                                                {
                                                    width: `${pct}%`,
                                                    backgroundColor: pct >= 80 ? Theme.colors.success : pct >= 60 ? Theme.colors.textPrimary : Theme.colors.textSecondary,
                                                },
                                            ]} />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <View style={styles.resultArrow}>
                            <ChevronRight size={18} color={Theme.colors.textTertiary} />
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <EmptyState
                        icon={<ClipboardList size={32} color={Theme.colors.primary} />}
                        title="No Results Yet"
                        subtitle="Your exam results will appear here once published by your school"
                    />
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
        position: 'relative',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    resultTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.md,
    },
    resultInfo: {
        flex: 1,
        marginRight: 12,
    },
    resultExam: {
        ...Theme.typography.h3,
        fontSize: 18,
    },
    resultDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    resultDate: {
        ...Theme.typography.caption,
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
    resultBottom: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.layout.borderRadiusIcon,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
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
    subjectPreview: {
        gap: 8,
    },
    subjectMini: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subjectMiniName: {
        ...Theme.typography.caption,
        color: Theme.colors.textSecondary,
        width: 80,
    },
    subjectMiniBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: Theme.colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    subjectMiniBarFill: {
        height: 6,
        borderRadius: 3,
    },
    resultArrow: {
        position: 'absolute',
        right: 16,
        top: 20,
    },
});
