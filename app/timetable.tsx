import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, BookOpen, Coffee, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot {
    id: string;
    time: string;
    subject: string;
    type: 'lecture' | 'practical' | 'recess';
    room?: string;
    className?: string; // For teacher's view: Which class to go to
}

const STUDENT_WEEKLY_DATA: Record<number, TimeSlot[]> = {
    1: [ // Monday
        { id: 'sm1', time: '08:00 - 08:45', subject: 'Artificial Intelligence', type: 'lecture', room: 'Lab 1' },
        { id: 'sm2', time: '08:45 - 09:30', subject: 'Software Testing & QA', type: 'lecture', room: 'Room 302' },
        { id: 'sm3', time: '09:30 - 10:15', subject: 'Cloud Computing (p)', type: 'practical', room: 'Lab 2' },
        { id: 'recess', time: '10:15 - 10:30', subject: 'Recess', type: 'recess' },
        { id: 'sm4', time: '10:30 - 11:15', subject: 'Information Security', type: 'lecture', room: 'Room 304' },
        { id: 'sm5', time: '11:15 - 12:00', subject: 'Web Services (p)', type: 'practical', room: 'Lab 3' },
    ],
    2: [ // Tuesday
        { id: 'st1', time: '08:00 - 08:45', subject: 'Information Security', type: 'lecture', room: 'Room 304' },
        { id: 'st2', time: '08:45 - 09:30', subject: 'Web Services', type: 'lecture', room: 'Lab 3' },
        { id: 'st3', time: '09:30 - 10:15', subject: 'AI Practicals (p)', type: 'practical', room: 'Lab 1' },
        { id: 'recess', time: '10:15 - 10:30', subject: 'Recess', type: 'recess' },
        { id: 'st4', time: '10:30 - 11:15', subject: 'Software Testing & QA', type: 'lecture', room: 'Room 302' },
        { id: 'st5', time: '11:15 - 12:00', subject: 'Game Programming (p)', type: 'practical', room: 'Lab 2' },
    ],
    // Fill other days as needed...
};

const TEACHER_WEEKLY_DATA: Record<number, TimeSlot[]> = {
    1: [ // Monday
        { id: 'tm1', time: '08:00 - 08:45', subject: 'Software Engineering', type: 'lecture', className: 'TYCS', room: 'Room 302' },
        { id: 'tm2', time: '08:45 - 09:30', subject: 'Web Technologies', type: 'lecture', className: 'FYCS', room: 'Lab 3' },
        { id: 'tm3', time: '09:30 - 10:15', subject: 'Cloud Computing (p)', type: 'practical', className: 'TYCS', room: 'Lab 2' },
        { id: 'recess', time: '10:15 - 10:30', subject: 'Staff Room / Tea', type: 'recess' },
        { id: 'tm4', time: '10:30 - 11:15', subject: 'Python Programming', type: 'lecture', className: 'SYCS', room: 'Room 201' },
        { id: 'tm5', time: '11:15 - 12:00', subject: 'Cyber Security', type: 'lecture', className: 'TYCS', room: 'Room 304' },
    ],
    2: [ // Tuesday
        { id: 'tt1', time: '08:00 - 08:45', subject: 'Data Structures', type: 'lecture', className: 'SYCS', room: 'Room 201' },
        { id: 'tt2', time: '08:45 - 09:30', subject: 'Software Engineering', type: 'lecture', className: 'TYCS', room: 'Room 302' },
        { id: 'tt3', time: '09:30 - 10:15', subject: 'Java Lab (p)', type: 'practical', className: 'FYCS', room: 'Lab 1' },
        { id: 'recess', time: '10:15 - 10:30', subject: 'Staff Room / Tea', type: 'recess' },
        { id: 'tt4', time: '10:30 - 11:15', subject: 'Web Technologies', type: 'lecture', className: 'FYCS', room: 'Lab 3' },
        { id: 'tt5', time: '11:15 - 12:00', subject: 'Cloud Computing (p)', type: 'practical', className: 'TYCS', room: 'Lab 2' },
    ],
    // Fill other days as needed...
};

const DAYS = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

export default function TimeTableScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { role } = useAuth();

    const isTeacher = role === 'teacher' || role === 'admin';

    // Default to current day, or Monday (1) if it's Sunday (0)
    const today = new Date().getDay();
    const [selectedDay, setSelectedDay] = useState(today === 0 ? 1 : today);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [selectedDay]);

    const activeData = isTeacher ? TEACHER_WEEKLY_DATA : STUDENT_WEEKLY_DATA;

    const renderCard = (slot: TimeSlot) => {
        if (slot.type === 'recess') {
            return (
                <View key={slot.id} style={styles.recessCard}>
                    <Coffee size={20} color={Theme.colors.textSecondary} style={{ marginRight: 12 }} />
                    <Text style={styles.recessText}>{slot.time} • {slot.subject}</Text>
                </View>
            );
        }

        return (
            <View key={slot.id} style={styles.slotCard}>
                <View style={[
                    styles.typeIndicator,
                    { backgroundColor: slot.type === 'practical' ? Theme.colors.success : Theme.colors.primary }
                ]} />
                <View style={styles.slotContent}>
                    <View style={styles.slotHeader}>
                        <Text style={styles.slotTime}>{slot.time}</Text>
                        <View style={[
                            styles.typeBadge,
                            { backgroundColor: slot.type === 'practical' ? Theme.colors.success + '10' : Theme.colors.primary + '10' }
                        ]}>
                            <Text style={[
                                styles.typeBadgeText,
                                { color: slot.type === 'practical' ? Theme.colors.success : Theme.colors.primary }
                            ]}>
                                {slot.type.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.slotSubject}>{slot.subject}</Text>

                    <View style={styles.metaRow}>
                        {isTeacher && slot.className && (
                            <View style={styles.metaItem}>
                                <UserBadge className={slot.className} />
                            </View>
                        )}
                        {slot.room && (
                            <View style={styles.metaItem}>
                                <MapPin size={14} color={Theme.colors.textTertiary} />
                                <Text style={styles.metaText}>{slot.room}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                >
                    <ArrowLeft size={24} color={Theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{isTeacher ? 'Faculty Schedule' : 'Student Schedule'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.dayTabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dayTabs}
                >
                    {DAYS.map((day) => (
                        <TouchableOpacity
                            key={day.value}
                            style={[
                                styles.dayTab,
                                selectedDay === day.value && styles.dayTabActive
                            ]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedDay(day.value);
                            }}
                        >
                            <Text style={[
                                styles.dayTabLabel,
                                selectedDay === day.value && styles.dayTabLabelActive
                            ]}>
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Animated.ScrollView
                style={{ opacity: fadeAnim }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.dayHeader}>
                    <Clock size={20} color={Theme.colors.primary} />
                    <Text style={styles.dayText}>
                        {today === selectedDay ? "Today's Plan" : `${DAYS.find(d => d.value === selectedDay)?.label}'s Plan`}
                    </Text>
                </View>

                {activeData[selectedDay] ? (
                    activeData[selectedDay].map(renderCard)
                ) : (
                    <View style={styles.emptyState}>
                        <Coffee size={48} color={Theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No lectures today. Have a restful break!</Text>
                    </View>
                )}

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Quick Note</Text>
                    <Text style={styles.infoText}>
                        {isTeacher
                            ? "Lectures marked with (p) are laboratory sessions. Please ensure the lab assistants are notified 10 mins before."
                            : "Lectures marked with (p) are Practical sessions held in the computer labs. Please report 5 minutes before the start time."}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    );
}

function UserBadge({ className }: { className: string }) {
    return (
        <View style={styles.userBadge}>
            <BookOpen size={12} color={Theme.colors.primary} />
            <Text style={styles.userBadgeText}>{className}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.paddingHorizontal,
        height: 60,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    title: {
        ...Theme.typography.h3,
        fontSize: 18,
    },
    dayTabsWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
        backgroundColor: Theme.colors.surface,
    },
    dayTabs: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingVertical: Theme.spacing.md,
        gap: 8,
    },
    dayTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Theme.layout.borderRadiusPill,
        backgroundColor: Theme.colors.background,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    dayTabActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    dayTabLabel: {
        ...Theme.typography.caption,
        fontWeight: '600',
        color: Theme.colors.textSecondary,
    },
    dayTabLabelActive: {
        color: Theme.colors.background,
    },
    scrollContent: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: Theme.spacing.lg,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        gap: 12,
    },
    dayText: {
        ...Theme.typography.h2,
        fontSize: 24,
    },
    slotCard: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        marginBottom: Theme.spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.sm,
    },
    typeIndicator: {
        width: 6,
    },
    slotContent: {
        flex: 1,
        padding: Theme.spacing.lg,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    slotTime: {
        ...Theme.typography.caption,
        fontWeight: '600',
        color: Theme.colors.textSecondary,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    slotSubject: {
        ...Theme.typography.h3,
        fontSize: 18,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        ...Theme.typography.caption,
        color: Theme.colors.textTertiary,
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    userBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    recessCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.surfaceDarker,
        padding: Theme.spacing.md,
        borderRadius: Theme.layout.borderRadiusCard,
        marginBottom: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderStyle: 'dashed',
    },
    recessText: {
        ...Theme.typography.body,
        color: Theme.colors.textSecondary,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        ...Theme.typography.body,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        width: '80%',
    },
    infoCard: {
        marginTop: Theme.spacing.lg,
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.lg,
        borderRadius: Theme.layout.borderRadiusCard,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    infoTitle: {
        ...Theme.typography.h3,
        fontSize: 16,
        marginBottom: 8,
    },
    infoText: {
        ...Theme.typography.body,
        color: Theme.colors.textSecondary,
        lineHeight: 22,
    },
});
