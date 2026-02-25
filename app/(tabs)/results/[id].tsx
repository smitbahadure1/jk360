import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';

export default function ResultDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getResultById } = useStudent();
    const result = getResultById(id ?? '');
    const animValues = useRef(
        Array.from({ length: 15 }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        if (result) {
            const anims = result.entries.map((_, i) =>
                Animated.timing(animValues[i], {
                    toValue: 1,
                    duration: 400,
                    delay: i * 80,
                    useNativeDriver: false,
                })
            );
            Animated.stagger(60, anims).start();
        }
    }, [result]);

    if (!result) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Result Details' }} />
                <Text style={styles.errorText}>Result not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: result.examName, headerShadowVisible: false, headerStyle: { backgroundColor: Theme.colors.background } }} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.examName}>{result.examName}</Text>
                            <Text style={styles.examDate}>
                                {new Date(result.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Text>
                        </View>
                        <View style={styles.gradeBadgeMinimal}>
                            <Text style={styles.gradeBadgeMinimalText}>{result.grade}</Text>
                        </View>
                    </View>

                    <View style={styles.headerStats}>
                        <View style={styles.headerStat}>
                            <Text style={styles.headerStatValue}>{result.totalMarks}</Text>
                            <Text style={styles.headerStatLabel}>Marks</Text>
                        </View>
                        <View style={styles.headerStatDivider} />
                        <View style={styles.headerStat}>
                            <Text style={styles.headerStatValue}>{result.totalMaxMarks}</Text>
                            <Text style={styles.headerStatLabel}>Total</Text>
                        </View>
                        <View style={styles.headerStatDivider} />
                        <View style={styles.headerStat}>
                            <Text style={[styles.headerStatValue, { color: Theme.colors.primary }]}>{result.percentage}%</Text>
                            <Text style={styles.headerStatLabel}>Percentage</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Breakdown</Text>

                {result.entries.map((entry, index) => {
                    const pct = entry.maxMarks > 0 ? (entry.marksObtained / entry.maxMarks) * 100 : 0;
                    const barColor = pct >= 80 ? Theme.colors.success : pct >= 60 ? Theme.colors.primary : pct >= 40 ? Theme.colors.textSecondary : Theme.colors.danger;
                    const animVal = animValues[index] ?? new Animated.Value(1);

                    const barWidth = animVal.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${pct}%`],
                    });

                    return (
                        <Animated.View
                            key={entry.subjectId}
                            style={[styles.subjectCard, { opacity: animVal }]}
                        >
                            <View style={styles.subjectHeader}>
                                <View style={styles.subjectLeft}>
                                    <Text style={styles.subjectName}>{entry.subjectName}</Text>
                                </View>
                                <View style={styles.subjectRight}>
                                    <Text style={styles.subjectMarks}>
                                        {entry.marksObtained}<Text style={styles.subjectMarksMax}>/{entry.maxMarks}</Text>
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.barBg}>
                                <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
                            </View>
                            <Text style={[styles.subjectPct, { color: barColor }]}>{Math.round(pct)}%</Text>
                        </Animated.View>
                    );
                })}

                <View style={styles.remarksCard}>
                    <Text style={styles.remarksTitle}>Summary</Text>
                    <Text style={styles.remarksText}>
                        {result.percentage >= 90
                            ? 'Outstanding performance! Keep up the excellent work.'
                            : result.percentage >= 80
                                ? 'Great job! You are performing really well across subjects.'
                                : result.percentage >= 70
                                    ? 'Good performance! A little more effort can take you to the top.'
                                    : result.percentage >= 60
                                        ? 'Decent performance. Focus on weaker subjects to improve.'
                                        : 'Needs improvement. Consider seeking extra help in weak areas.'}
                    </Text>
                </View>

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
    errorText: {
        ...Theme.typography.body,
        textAlign: 'center',
        marginTop: 60,
    },
    headerCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.lg,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.lg,
    },
    examName: {
        ...Theme.typography.h2,
    },
    examDate: {
        ...Theme.typography.caption,
        marginTop: 4,
    },
    gradeBadgeMinimal: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradeBadgeMinimalText: {
        ...Theme.typography.h2,
        color: Theme.colors.background,
    },
    headerStats: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.layout.borderRadiusIcon,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    headerStat: {
        flex: 1,
        alignItems: 'center',
    },
    headerStatValue: {
        ...Theme.typography.h2,
        fontSize: 22,
    },
    headerStatLabel: {
        ...Theme.typography.caption,
        marginTop: 4,
    },
    headerStatDivider: {
        width: 1,
        backgroundColor: Theme.colors.border,
        marginVertical: 4,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        marginBottom: Theme.spacing.sm,
    },
    subjectCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    subjectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    subjectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subjectName: {
        ...Theme.typography.bodyLarge,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    subjectRight: {
        alignItems: 'flex-end',
    },
    subjectMarks: {
        ...Theme.typography.h3,
    },
    subjectMarksMax: {
        ...Theme.typography.body,
        fontWeight: '500',
    },
    barBg: {
        height: 8,
        backgroundColor: Theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    barFill: {
        height: 8,
        borderRadius: 4,
    },
    subjectPct: {
        ...Theme.typography.caption,
        fontWeight: '700',
        textAlign: 'right',
    },
    remarksCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        marginTop: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.primary,
    },
    remarksTitle: {
        ...Theme.typography.h3,
        marginBottom: 6,
    },
    remarksText: {
        ...Theme.typography.body,
    },
});
