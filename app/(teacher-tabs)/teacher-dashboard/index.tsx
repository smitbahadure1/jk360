import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, ClipboardList, TrendingUp, Calendar, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function TeacherDashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    const [refreshing, setRefreshing] = useState(false);
    const [assignedClass, setAssignedClass] = useState('');
    const [assignedSection, setAssignedSection] = useState('');

    const { userId } = useAuth();
    const { adminProfile, students, results, announcements } = useAdmin();

    useEffect(() => {
        loadAssignment();
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, [userId]);

    const loadAssignment = async () => {
        if (!userId) return;
        const { data } = await supabase.from('teachers').select('*').eq('profile_id', userId).single();
        if (data) {
            setAssignedClass(data.class_assigned);
            setAssignedSection(data.section_assigned);
        }
    };

    const myStudents = useMemo(() => {
        if (!assignedClass) return [];
        return students.filter(s => s.className === assignedClass && s.section === assignedSection);
    }, [students, assignedClass, assignedSection]);

    const myResults = useMemo(() => {
        const studentIds = new Set(myStudents.map(s => s.id));
        return results.filter(r => studentIds.has(r.studentId));
    }, [results, myStudents]);

    const avgPerformance = myResults.length > 0
        ? Math.round((myResults.reduce((s, r) => s + r.percentage, 0) / myResults.length) * 10) / 10
        : 0;

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        loadAssignment().finally(() => setRefreshing(false));
    }, [userId]);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
            >
                <Animated.View style={[styles.header, { paddingTop: insets.top + 20, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.greeting}>Teacher Portal,</Text>
                    <Text style={styles.adminName}>{adminProfile.name}</Text>

                    <View style={styles.headerBadge}>
                        <View style={styles.badgeIndicator} />
                        <Text style={styles.headerBadgeText}>{assignedClass || 'Loading...'} {assignedSection ? `(Sec ${assignedSection})` : ''}</Text>
                        <View style={styles.badgeSpacer} />
                        <Text style={styles.headerBadgeText}>{adminProfile.school}</Text>
                    </View>
                </Animated.View>

                <View style={styles.content}>
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
                                <Text style={styles.timeTableHeroTitle}>Faculty Time Table</Text>
                                <Text style={styles.timeTableHeroSub}>View lecture & practical schedules</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={Theme.colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={styles.quickStatsRow}>
                        <TouchableOpacity style={styles.quickStatCard} activeOpacity={0.7} onPress={() => router.push('/students' as any)}>
                            <View style={styles.quickStatIconWrap}>
                                <Users size={20} color={Theme.colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.quickStatValue}>{myStudents.length}</Text>
                            <Text style={styles.quickStatLabel}>My Students</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickStatCard} activeOpacity={0.7} onPress={() => router.push('/admin-results' as any)}>
                            <View style={styles.quickStatIconWrap}>
                                <ClipboardList size={20} color={Theme.colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.quickStatValue}>{myResults.length}</Text>
                            <Text style={styles.quickStatLabel}>Grades Logged</Text>
                        </TouchableOpacity>

                        <View style={styles.quickStatCard}>
                            <View style={styles.quickStatIconWrap}>
                                <TrendingUp size={20} color={Theme.colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.quickStatValue}>{avgPerformance}%</Text>
                            <Text style={styles.quickStatLabel}>Class Avg</Text>
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Roster</Text>
                        <TouchableOpacity onPress={() => router.push('/students' as any)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {myStudents.length === 0 ? (
                        <Text style={styles.emptyText}>No students assigned to your class.</Text>
                    ) : (
                        myStudents.slice(0, 3).map((student) => {
                            const initials = `${student.firstName[0]}${student.lastName[0]}`;
                            return (
                                <TouchableOpacity
                                    key={student.id}
                                    style={styles.studentRow}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        router.push(`/students/${student.id}` as any);
                                    }}
                                >
                                    <View style={styles.studentAvatar}>
                                        <Text style={styles.studentAvatarText}>{initials}</Text>
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
                                        <Text style={styles.studentDetail}>Roll Number {student.rollNumber}</Text>
                                    </View>
                                    <ChevronRight size={16} color={Theme.colors.textTertiary} />
                                </TouchableOpacity>
                            );
                        })
                    )}

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>School Announcements</Text>
                    </View>
                    {announcements.map((item) => (
                        <View key={item.id} style={styles.announcementCard}>
                            <View style={styles.announcementIcon}>
                                <Calendar size={18} color={Theme.colors.textPrimary} />
                            </View>
                            <View style={styles.announcementContent}>
                                <Text style={styles.announcementTitle}>{item.title}</Text>
                                <View style={styles.announcementMeta}>
                                    <Text style={styles.announcementDate}>
                                        {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    <View style={{ height: Theme.spacing.xxxl }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { paddingHorizontal: Theme.layout.paddingHorizontal, paddingBottom: Theme.spacing.xl },
    greeting: { ...Theme.typography.bodyLarge, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.xs },
    adminName: { ...Theme.typography.h1, marginBottom: Theme.spacing.md },
    headerBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface,
        paddingHorizontal: Theme.spacing.md, paddingVertical: 6,
        borderRadius: 12, alignSelf: 'flex-start',
        borderWidth: 1, borderColor: Theme.colors.border,
        maxWidth: '100%', flexWrap: 'wrap',
    },
    badgeIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.success, marginRight: 8, marginTop: 2 },
    headerBadgeText: { ...Theme.typography.caption, color: Theme.colors.textPrimary, lineHeight: 18 },
    badgeSpacer: { width: 1, height: 12, backgroundColor: Theme.colors.border, marginHorizontal: 8, display: 'none' },
    content: { paddingHorizontal: Theme.layout.paddingHorizontal },
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
    quickStatsRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
    quickStatCard: { flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.layout.borderRadiusCard, padding: Theme.spacing.md, ...Theme.shadows.sm, borderWidth: 1, borderColor: Theme.colors.border },
    quickStatIconWrap: { width: 40, height: 40, borderRadius: Theme.layout.borderRadiusIcon, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.sm, borderWidth: 1, borderColor: Theme.colors.border },
    quickStatValue: { ...Theme.typography.h2, marginBottom: 2 },
    quickStatLabel: { ...Theme.typography.caption },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.md, marginTop: Theme.spacing.sm },
    sectionTitle: { ...Theme.typography.h3 },
    seeAllText: { ...Theme.typography.body, fontWeight: '500', color: Theme.colors.textSecondary },
    emptyText: { ...Theme.typography.body, color: Theme.colors.textTertiary, fontStyle: 'italic', marginBottom: 20 },
    studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: Theme.layout.borderRadiusCard, padding: Theme.spacing.md, marginBottom: Theme.spacing.sm, ...Theme.shadows.sm, borderWidth: 1, borderColor: Theme.colors.border },
    studentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Theme.spacing.md },
    studentAvatarText: { ...Theme.typography.h3, color: Theme.colors.background },
    studentInfo: { flex: 1 },
    studentName: { ...Theme.typography.bodyLarge, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: 2 },
    studentDetail: { ...Theme.typography.caption },
    announcementCard: { backgroundColor: Theme.colors.surface, borderRadius: Theme.layout.borderRadiusCard, padding: Theme.spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.sm, ...Theme.shadows.sm, borderWidth: 1, borderColor: Theme.colors.border },
    announcementIcon: { width: 44, height: 44, borderRadius: Theme.layout.borderRadiusIcon, alignItems: 'center', justifyContent: 'center', marginRight: Theme.spacing.md, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.border },
    announcementContent: { flex: 1 },
    announcementTitle: { ...Theme.typography.bodyLarge, fontWeight: '600', color: Theme.colors.textPrimary },
    announcementMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    announcementDate: { ...Theme.typography.caption },
});
