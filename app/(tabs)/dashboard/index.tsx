import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    TrendingUp,
    Award,
    BookOpen,
    Calendar,
    Bell,
    ChevronRight,
    Clock,
    CheckCircle,
    Megaphone,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getDaysUntil(dateStr: string): number {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {
        student,
        attendance,
        upcomingExams,
        announcements,
        latestResult,
        overallStats,
    } = useStudent();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    const getAnnouncementIcon = (type: string) => {
        switch (type) {
            case 'event': return <Calendar size={18} color={Theme.colors.textPrimary} strokeWidth={1.5} />;
            case 'result': return <CheckCircle size={18} color={Theme.colors.success} strokeWidth={1.5} />;
            case 'notice': return <Megaphone size={18} color={Theme.colors.star} strokeWidth={1.5} />;
            default: return <Bell size={18} color={Theme.colors.textPrimary} strokeWidth={1.5} />;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.textPrimary} />
                }
            >
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>

                    <View style={styles.headerBadge}>
                        <View style={styles.badgeIndicator} />
                        <Text style={styles.headerBadgeText}>{student.className} • Section {student.section}</Text>
                        <View style={styles.badgeSpacer} />
                        <Text style={styles.headerBadgeText}>ID: {student.rollNumber}</Text>
                    </View>
                </Animated.View>

                <View style={styles.content}>
                    {/* Action Hub */}
                    <TouchableOpacity
                        style={styles.timeTableHero}
                        activeOpacity={0.8}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/timetable' as any);
                        }}
                    >
                        <View style={styles.timeTableHeroContent}>
                            <View style={styles.timeTableHeroIcon}>
                                <Calendar size={24} color={Theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.timeTableHeroTitle}>View Time Table</Text>
                                <Text style={styles.timeTableHeroSub}>8:00 AM — 12:00 PM</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={Theme.colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Quick Stats Grid */}
                    <View style={styles.quickStatsRow}>
                        <TouchableOpacity
                            style={styles.quickStatCard}
                            activeOpacity={0.7}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/performance' as any);
                            }}
                        >
                            <View style={styles.quickStatIconWrap}>
                                <TrendingUp size={20} color={Theme.colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.quickStatValue}>{overallStats.avgPercentage}%</Text>
                            <Text style={styles.quickStatLabel}>Average</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickStatCard}
                            activeOpacity={0.7}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/results' as any);
                            }}
                        >
                            <View style={styles.quickStatIconWrap}>
                                <Award size={20} color={Theme.colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.quickStatValue}>{overallStats.bestGrade}</Text>
                            <Text style={styles.quickStatLabel}>Top Grade</Text>
                        </TouchableOpacity>

                        <View style={styles.quickStatCard}>
                            <View style={styles.quickStatIconWrap}>
                                <BookOpen size={20} color={Theme.colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.quickStatValue}>{overallStats.totalExams}</Text>
                            <Text style={styles.quickStatLabel}>Exams</Text>
                        </View>
                    </View>

                    {/* Minimalist Attendance Card */}
                    <View style={styles.attendanceCard}>
                        <View style={styles.attendanceHeader}>
                            <Text style={styles.sectionTitle}>Attendance</Text>
                            <View style={styles.attendancePctWrap}>
                                <Text style={styles.attendancePct}>{attendance.percentage}%</Text>
                            </View>
                        </View>
                        <View style={styles.attendanceBarBg}>
                            <View style={[styles.attendanceBarFill, { width: `${attendance.percentage}%` }]} />
                        </View>
                        <View style={styles.attendanceRow}>
                            <Text style={styles.attendanceItemText}>
                                <Text style={{ color: Theme.colors.success, fontWeight: '600' }}>Present </Text>{attendance.presentDays}
                            </Text>
                            <Text style={styles.attendanceItemText}>
                                <Text style={{ color: Theme.colors.danger, fontWeight: '600' }}>Absent </Text>{attendance.absentDays}
                            </Text>
                            <Text style={styles.attendanceItemText}>
                                <Text style={{ color: Theme.colors.star, fontWeight: '600' }}>Late </Text>{attendance.lateDays}
                            </Text>
                        </View>
                    </View>

                    {/* Latest Result */}
                    {latestResult && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Latest Result</Text>
                                <TouchableOpacity onPress={() => router.push('/results' as any)}>
                                    <Text style={styles.seeAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.latestResultCard}
                                activeOpacity={0.7}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push(`/results/${latestResult.id}` as any);
                                }}
                            >
                                <View style={styles.latestResultTop}>
                                    <View>
                                        <Text style={styles.latestResultExam}>{latestResult.examName}</Text>
                                        <Text style={styles.latestResultDate}>{formatDate(latestResult.createdAt)}</Text>
                                    </View>
                                    <View style={styles.gradeBadgeMinimal}>
                                        <Text style={styles.gradeBadgeMinimalText}>{latestResult.grade}</Text>
                                    </View>
                                </View>

                                <View style={styles.latestResultStats}>
                                    <View style={styles.latestResultStat}>
                                        <Text style={styles.latestResultStatValue}>{latestResult.percentage}%</Text>
                                        <Text style={styles.latestResultStatLabel}>Score</Text>
                                    </View>
                                    <View style={styles.latestResultStatDivider} />
                                    <View style={styles.latestResultStat}>
                                        <Text style={styles.latestResultStatValue}>{latestResult.totalMarks}</Text>
                                        <Text style={styles.latestResultStatLabel}>Marks</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Upcoming Exams */}
                    {upcomingExams.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Upcoming</Text>
                            </View>
                            {upcomingExams.map((exam) => {
                                const daysLeft = getDaysUntil(exam.date);
                                return (
                                    <View key={exam.id} style={styles.examCard}>
                                        <View style={styles.examDateBox}>
                                            <Text style={styles.examDateDay}>{new Date(exam.date).getDate()}</Text>
                                            <Text style={styles.examDateMonth}>{new Date(exam.date).toLocaleString('default', { month: 'short' })}</Text>
                                        </View>
                                        <View style={styles.examInfo}>
                                            <Text style={styles.examSubject}>{exam.subject}</Text>
                                            <Text style={styles.examType}>{exam.name}</Text>
                                        </View>
                                        <View style={styles.examDaysLeft}>
                                            <Text style={[
                                                styles.examDaysText,
                                                daysLeft <= 3 && { color: Theme.colors.danger }
                                            ]}>
                                                {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {/* Announcements */}
                    {announcements.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Updates</Text>
                            </View>
                            {announcements.map((item) => (
                                <View key={item.id} style={styles.announcementCard}>
                                    <View style={styles.announcementIconWrap}>
                                        {getAnnouncementIcon(item.type)}
                                    </View>
                                    <View style={styles.announcementContent}>
                                        <Text style={styles.announcementTitle}>{item.title}</Text>
                                        <Text style={styles.announcementDesc} numberOfLines={2}>{item.description}</Text>
                                        <Text style={styles.announcementDate}>{formatDate(item.date)}</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    <View style={{ height: Theme.spacing.xxxl }} />
                </View>
            </ScrollView>
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
        paddingTop: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    greeting: {
        fontSize: Theme.typography.bodyLarge.fontSize,
        color: Theme.colors.textSecondary,
        fontWeight: '400',
        marginBottom: Theme.spacing.xs,
    },
    studentName: {
        ...Theme.typography.h1,
        marginBottom: Theme.spacing.md,
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        borderRadius: Theme.layout.borderRadiusPill,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    badgeIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.success,
        marginRight: 8,
    },
    headerBadgeText: {
        ...Theme.typography.caption,
        color: Theme.colors.textPrimary,
    },
    badgeSpacer: {
        width: 1,
        height: 12,
        backgroundColor: Theme.colors.border,
        marginHorizontal: 8,
    },
    content: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
    },
    timeTableHero: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.sm,
    },
    timeTableHeroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    timeTableHeroIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeTableHeroTitle: {
        ...Theme.typography.h3,
        fontSize: 16,
    },
    timeTableHeroSub: {
        ...Theme.typography.caption,
        color: Theme.colors.textSecondary,
        marginTop: 2,
    },
    quickStatsRow: {
        flexDirection: 'row',
        gap: Theme.spacing.sm,
        marginBottom: Theme.spacing.lg,
    },
    quickStatCard: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        ...Theme.shadows.sm,
    },
    quickStatIconWrap: {
        width: 40,
        height: 40,
        borderRadius: Theme.layout.borderRadiusIcon,
        backgroundColor: Theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    quickStatValue: {
        ...Theme.typography.h2,
        marginBottom: 2,
    },
    quickStatLabel: {
        ...Theme.typography.caption,
    },
    attendanceCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.lg,
        ...Theme.shadows.sm,
    },
    attendanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    attendancePctWrap: {
        backgroundColor: Theme.colors.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Theme.layout.borderRadiusPill,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    attendancePct: {
        ...Theme.typography.body,
        fontWeight: '700',
        color: Theme.colors.textPrimary,
    },
    attendanceBarBg: {
        height: 6,
        backgroundColor: Theme.colors.border,
        borderRadius: 3,
        marginBottom: Theme.spacing.md,
        overflow: 'hidden',
    },
    attendanceBarFill: {
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.primary,
    },
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    attendanceItemText: {
        ...Theme.typography.body,
        fontSize: 13,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        marginTop: Theme.spacing.sm,
    },
    sectionTitle: {
        ...Theme.typography.h3,
    },
    seeAllText: {
        ...Theme.typography.body,
        color: Theme.colors.textSecondary,
        fontWeight: '500',
    },
    latestResultCard: {
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.lg,
        ...Theme.shadows.sm,
    },
    latestResultTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.md,
    },
    latestResultExam: {
        ...Theme.typography.h3,
        fontSize: 18,
        marginBottom: 4,
    },
    latestResultDate: {
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
    latestResultStats: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.layout.borderRadiusIcon,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    latestResultStat: {
        flex: 1,
        alignItems: 'center',
    },
    latestResultStatValue: {
        ...Theme.typography.h2,
        fontSize: 20,
        marginBottom: 2,
    },
    latestResultStatLabel: {
        ...Theme.typography.caption,
    },
    latestResultStatDivider: {
        width: 1,
        backgroundColor: Theme.colors.border,
        marginVertical: 4,
    },
    examCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
        ...Theme.shadows.sm,
    },
    examDateBox: {
        width: 50,
        height: 50,
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.layout.borderRadiusIcon,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    examDateDay: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.primary,
        marginBottom: -2,
    },
    examDateMonth: {
        ...Theme.typography.caption,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    examInfo: {
        flex: 1,
    },
    examSubject: {
        ...Theme.typography.bodyLarge,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginBottom: 2,
    },
    examType: {
        ...Theme.typography.caption,
    },
    examDaysLeft: {
        backgroundColor: Theme.colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Theme.layout.borderRadiusPill,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    examDaysText: {
        ...Theme.typography.caption,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    announcementCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        flexDirection: 'row',
        marginBottom: Theme.spacing.sm,
        ...Theme.shadows.sm,
    },
    announcementIconWrap: {
        width: 40,
        height: 40,
        borderRadius: Theme.layout.borderRadiusIcon,
        backgroundColor: Theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    announcementContent: {
        flex: 1,
    },
    announcementTitle: {
        ...Theme.typography.bodyLarge,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginBottom: 4,
    },
    announcementDesc: {
        ...Theme.typography.body,
        marginBottom: 6,
    },
    announcementDate: {
        ...Theme.typography.caption,
        fontSize: 11,
    },
});
