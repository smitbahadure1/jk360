import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { TrendingUp, Award, Target, Zap, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';

export default function PerformanceScreen() {
    const { results, overallStats, subjectAverages, performanceTrend } = useStudent();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    const trendDirection = useMemo(() => {
        if (performanceTrend.length < 2) return 'stable';
        const last = performanceTrend[performanceTrend.length - 1];
        const prev = performanceTrend[performanceTrend.length - 2];
        if (last.percentage > prev.percentage) return 'up';
        if (last.percentage < prev.percentage) return 'down';
        return 'stable';
    }, [performanceTrend]);

    const strongestSubject = subjectAverages.length > 0 ? subjectAverages[0] : null;
    const weakestSubject = subjectAverages.length > 0 ? subjectAverages[subjectAverages.length - 1] : null;

    const maxTrendPct = useMemo(() => {
        if (performanceTrend.length === 0) return 100;
        return Math.max(...performanceTrend.map((t) => t.percentage), 100);
    }, [performanceTrend]);

    if (results.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <TrendingUp size={48} color={Theme.colors.textTertiary} />
                    <Text style={styles.emptyTitle}>No Performance Data</Text>
                    <Text style={styles.emptySubtitle}>
                        Your performance analytics will appear here after your exam results are published
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
            >
                <View style={styles.overviewGrid}>
                    <View style={styles.overviewCard}>
                        <View style={styles.overviewIconRow}>
                            <TrendingUp size={20} color={Theme.colors.primary} />
                            {trendDirection === 'up' && <ArrowUpRight size={16} color={Theme.colors.success} />}
                            {trendDirection === 'down' && <ArrowDownRight size={16} color={Theme.colors.danger} />}
                            {trendDirection === 'stable' && <Minus size={16} color={Theme.colors.textTertiary} />}
                        </View>
                        <Text style={styles.overviewValue}>{overallStats.avgPercentage}%</Text>
                        <Text style={styles.overviewLabel}>Average Score</Text>
                    </View>

                    <View style={styles.overviewCard}>
                        <View style={styles.overviewIconRow}>
                            <Award size={20} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.overviewValue}>{overallStats.bestPercentage}%</Text>
                        <Text style={styles.overviewLabel}>Best Score</Text>
                    </View>

                    <View style={styles.overviewCard}>
                        <View style={styles.overviewIconRow}>
                            <Target size={20} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.overviewValue}>{overallStats.totalExams}</Text>
                        <Text style={styles.overviewLabel}>Total Exams</Text>
                    </View>

                    <View style={styles.overviewCard}>
                        <View style={styles.overviewIconRow}>
                            <Zap size={20} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.overviewValue}>{overallStats.bestGrade}</Text>
                        <Text style={styles.overviewLabel}>Best Grade</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Exam Trend</Text>
                <View style={styles.trendCard}>
                    <View style={styles.trendChart}>
                        {performanceTrend.map((item, i) => {
                            const height = (item.percentage / maxTrendPct) * 120;
                            const barColor = item.percentage >= 80 ? Theme.colors.success
                                : item.percentage >= 60 ? Theme.colors.primary
                                    : item.percentage >= 40 ? Theme.colors.textSecondary
                                        : Theme.colors.danger;
                            return (
                                <View key={i} style={styles.trendBarWrap}>
                                    <View style={styles.trendBarContainer}>
                                        <View style={[styles.trendBar, { height, backgroundColor: barColor }]}>
                                            <Text style={styles.trendBarValue}>{item.percentage}%</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.trendBarLabel} numberOfLines={1}>{item.examName.split(' ')[0]}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Subject Performance</Text>
                <View style={styles.subjectCard}>
                    {subjectAverages.map((sub, i) => {
                        const barColor = sub.average >= 80 ? Theme.colors.success
                            : sub.average >= 60 ? Theme.colors.primary
                                : sub.average >= 40 ? Theme.colors.textSecondary
                                    : Theme.colors.danger;
                        const isStrongest = strongestSubject?.name === sub.name;
                        const isWeakest = weakestSubject?.name === sub.name && subjectAverages.length > 1;

                        return (
                            <View key={sub.name} style={[styles.subjectRow, i === subjectAverages.length - 1 && { marginBottom: 0 }]}>
                                <View style={styles.subjectInfo}>
                                    <View style={styles.subjectNameRow}>
                                        <Text style={styles.subjectName}>{sub.name}</Text>
                                        {isStrongest && (
                                            <View style={[styles.subjectTag, { backgroundColor: Theme.colors.background }]}>
                                                <Text style={[styles.subjectTagText, { color: Theme.colors.success }]}>Top</Text>
                                            </View>
                                        )}
                                        {isWeakest && (
                                            <View style={[styles.subjectTag, { backgroundColor: Theme.colors.background }]}>
                                                <Text style={[styles.subjectTagText, { color: Theme.colors.danger }]}>Focus</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.subjectAvg, { color: Theme.colors.textPrimary }]}>{sub.average}%</Text>
                                </View>
                                <View style={styles.subjectBarBg}>
                                    <View
                                        style={[styles.subjectBarFill, { width: `${sub.average}%`, backgroundColor: barColor }]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {(strongestSubject || weakestSubject) && (
                    <>
                        <Text style={styles.sectionTitle}>Insights</Text>
                        <View style={styles.insightsCard}>
                            {strongestSubject && (
                                <View style={styles.insightRow}>
                                    <View style={[styles.insightIcon, { backgroundColor: Theme.colors.background }]}>
                                        <ArrowUpRight size={18} color={Theme.colors.success} />
                                    </View>
                                    <View style={styles.insightContent}>
                                        <Text style={styles.insightTitle}>Strongest Subject</Text>
                                        <Text style={styles.insightText}>
                                            {strongestSubject.name} with an average of {strongestSubject.average}%
                                        </Text>
                                    </View>
                                </View>
                            )}
                            {weakestSubject && subjectAverages.length > 1 && (
                                <View style={[styles.insightRow, { borderBottomWidth: 0 }]}>
                                    <View style={[styles.insightIcon, { backgroundColor: Theme.colors.background }]}>
                                        <Target size={18} color={Theme.colors.textPrimary} />
                                    </View>
                                    <View style={styles.insightContent}>
                                        <Text style={styles.insightTitle}>Area for Improvement</Text>
                                        <Text style={styles.insightText}>
                                            Focus more on {weakestSubject.name} (avg: {weakestSubject.average}%)
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: Theme.spacing.xxxl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scroll: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: Theme.spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: Theme.spacing.xxl,
    },
    emptyTitle: {
        ...Theme.typography.h2,
        marginTop: Theme.spacing.md,
    },
    emptySubtitle: {
        ...Theme.typography.body,
        textAlign: 'center',
        marginTop: Theme.spacing.sm,
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: Theme.spacing.md,
    },
    overviewCard: {
        backgroundColor: Theme.colors.surface,
        width: '48%',
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        flexGrow: 1,
        flexBasis: '45%',
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    overviewIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.md,
    },
    overviewValue: {
        ...Theme.typography.h2,
    },
    overviewLabel: {
        ...Theme.typography.caption,
        marginTop: 2,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        marginTop: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    trendCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    trendChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
    },
    trendBarWrap: {
        alignItems: 'center',
        flex: 1,
    },
    trendBarContainer: {
        height: 130,
        justifyContent: 'flex-end',
    },
    trendBar: {
        width: 38,
        borderRadius: 8,
        minHeight: 24,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 6,
    },
    trendBarValue: {
        ...Theme.typography.caption,
        fontSize: 10,
        color: Theme.colors.background,
    },
    trendBarLabel: {
        ...Theme.typography.caption,
        fontSize: 10,
        marginTop: 8,
        textAlign: 'center',
    },
    subjectCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    subjectRow: {
        marginBottom: Theme.spacing.lg,
    },
    subjectInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    subjectNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subjectName: {
        ...Theme.typography.bodyLarge,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    subjectTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Theme.layout.borderRadiusPill,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    subjectTagText: {
        ...Theme.typography.caption,
        fontSize: 10,
    },
    subjectAvg: {
        ...Theme.typography.h3,
    },
    subjectBarBg: {
        height: 8,
        backgroundColor: Theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    subjectBarFill: {
        height: 8,
        borderRadius: 4,
    },
    insightsCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    insightRow: {
        flexDirection: 'row',
        paddingVertical: Theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    insightIcon: {
        width: 44,
        height: 44,
        borderRadius: Theme.layout.borderRadiusIcon,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    insightContent: {
        flex: 1,
        justifyContent: 'center',
    },
    insightTitle: {
        ...Theme.typography.h3,
        fontSize: 16,
        marginBottom: 2,
    },
    insightText: {
        ...Theme.typography.body,
    },
});
