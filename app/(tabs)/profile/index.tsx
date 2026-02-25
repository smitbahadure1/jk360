import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Bell,
    Shield,
    HelpCircle,
    Info,
    Trash2,
    LogOut,
    ChevronRight,
    Moon,
    User,
    BookOpen,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Hash,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { student, overallStats, attendance } = useStudent();
    const { signOut } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const initials = `${student.firstName[0]}${student.lastName[0]}`;

    const handleClearData = () => {
        Alert.alert(
            'Clear Local Data',
            'This will reset the app data on this device. You can log in again to restore your information.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        Alert.alert('Done', 'Local data has been cleared. Restart the app to see changes.');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/profile-edit' as any);
                        }}
                    >
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.profileName}>{student.firstName} {student.lastName}</Text>
                    <Text style={styles.profileSubtitle}>{student.className} • Section {student.section}</Text>

                    <View style={styles.profileStatsRow}>
                        <View style={styles.profileStat}>
                            <Text style={styles.profileStatValue}>{overallStats.avgPercentage}%</Text>
                            <Text style={styles.profileStatLabel}>Average</Text>
                        </View>
                        <View style={styles.profileStatDivider} />
                        <View style={styles.profileStat}>
                            <Text style={styles.profileStatValue}>{overallStats.totalExams}</Text>
                            <Text style={styles.profileStatLabel}>Exams</Text>
                        </View>
                        <View style={styles.profileStatDivider} />
                        <View style={styles.profileStat}>
                            <Text style={styles.profileStatValue}>{attendance.percentage}%</Text>
                            <Text style={styles.profileStatLabel}>Attendance</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Profile Details</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon={<Hash size={18} color={Theme.colors.textPrimary} />} label="Roll Number" value={student.rollNumber} />
                    <InfoRow icon={<Calendar size={18} color={Theme.colors.textPrimary} />} label="Date of Birth" value={formatDOB(student.dateOfBirth)} />
                    <InfoRow icon={<User size={18} color={Theme.colors.textPrimary} />} label="Gender" value={student.gender} />
                    <InfoRow icon={<Mail size={18} color={Theme.colors.textPrimary} />} label="Email" value={student.email} />
                    <InfoRow icon={<Phone size={18} color={Theme.colors.success} />} label="Phone" value={student.phone} isLast />
                </View>

                <Text style={styles.sectionTitle}>Guardian</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon={<User size={18} color={Theme.colors.textPrimary} />} label="Guardian Name" value={student.guardianName} />
                    <InfoRow icon={<Phone size={18} color={Theme.colors.textPrimary} />} label="Guardian Phone" value={student.guardianPhone} />
                    <InfoRow icon={<MapPin size={18} color={Theme.colors.textPrimary} />} label="Address" value={student.address} isLast />
                </View>

                <Text style={styles.sectionTitle}>Classroom</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon={<BookOpen size={18} color={Theme.colors.textPrimary} />} label="Class" value={student.className} />
                    <InfoRow icon={<BookOpen size={18} color={Theme.colors.textPrimary} />} label="Section" value={student.section} isLast />
                </View>

                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.settingsCard}>
                    <SettingsRow
                        icon={<Bell size={20} color={Theme.colors.textPrimary} />}
                        label="Notifications"
                        right={
                            <Switch
                                value={notifications}
                                onValueChange={(val) => {
                                    setNotifications(val);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
                                thumbColor={Theme.colors.surface}
                            />
                        }
                    />
                    <SettingsRow
                        icon={<Moon size={20} color={Theme.colors.textPrimary} />}
                        label="Dark Mode"
                        right={
                            <Switch
                                value={darkMode}
                                onValueChange={(val) => {
                                    setDarkMode(val);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
                                thumbColor={Theme.colors.surface}
                            />
                        }
                    />
                </View>

                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.settingsCard}>
                    <SettingsRow
                        icon={<HelpCircle size={20} color={Theme.colors.textPrimary} />}
                        label="Help & FAQ"
                        right={<ChevronRight size={18} color={Theme.colors.textTertiary} />}
                        onPress={() => { }}
                    />
                    <SettingsRow
                        icon={<Shield size={20} color={Theme.colors.textPrimary} />}
                        label="Privacy Policy"
                        right={<ChevronRight size={18} color={Theme.colors.textTertiary} />}
                        onPress={() => { }}
                    />
                    <SettingsRow
                        icon={<Info size={20} color={Theme.colors.textPrimary} />}
                        label="About"
                        right={<Text style={styles.versionText}>v1.0.0</Text>}
                        onPress={() => { }}
                    />
                </View>

                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingsCard}>
                    <SettingsRow
                        icon={<Trash2 size={20} color={Theme.colors.textPrimary} />}
                        label="Clear Local Data"
                        onPress={handleClearData}
                    />
                    <SettingsRow
                        icon={<LogOut size={20} color={Theme.colors.danger} />}
                        label="Sign Out"
                        labelColor={Theme.colors.danger}
                        onPress={() => {
                            Alert.alert(
                                'Sign Out',
                                'Are you sure you want to sign out?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Sign Out',
                                        style: 'destructive',
                                        onPress: () => {
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                            signOut();
                                            router.replace('/sign-in' as any);
                                        },
                                    },
                                ]
                            );
                        }}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function formatDOB(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function InfoRow({
    icon,
    label,
    value,
    isLast,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    isLast?: boolean;
}) {
    return (
        <View style={[infoRowStyles.row, isLast && { borderBottomWidth: 0 }]}>
            <View style={infoRowStyles.iconWrap}>{icon}</View>
            <View style={infoRowStyles.content}>
                <Text style={infoRowStyles.label}>{label}</Text>
                <Text style={infoRowStyles.value}>{value}</Text>
            </View>
        </View>
    );
}

const infoRowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: Theme.layout.borderRadiusIcon,
        backgroundColor: Theme.colors.surfaceDarker,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    content: {
        flex: 1,
    },
    label: {
        ...Theme.typography.caption,
        textTransform: 'uppercase',
    },
    value: {
        ...Theme.typography.h3,
        fontSize: 16,
        marginTop: 2,
    },
});

function SettingsRow({
    icon,
    label,
    labelColor,
    right,
    onPress,
}: {
    icon: React.ReactNode;
    label: string;
    labelColor?: string;
    right?: React.ReactNode;
    onPress?: () => void;
}) {
    const content = (
        <View style={settingsRowStyles.row}>
            <View style={settingsRowStyles.iconWrap}>{icon}</View>
            <Text style={[settingsRowStyles.label, labelColor ? { color: labelColor } : null]}>
                {label}
            </Text>
            {right && <View style={settingsRowStyles.right}>{right}</View>}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const settingsRowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: Theme.layout.borderRadiusIcon,
        backgroundColor: Theme.colors.surfaceDarker,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    label: {
        ...Theme.typography.h3,
        fontSize: 16,
        flex: 1,
    },
    right: {
        marginLeft: Theme.spacing.sm,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scroll: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xxxl,
    },
    profileHeader: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.xl,
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        position: 'relative',
    },
    editBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Theme.colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    editBtnText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    avatarCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.md,
    },
    avatarText: {
        ...Theme.typography.h1,
        color: Theme.colors.background,
    },
    profileName: {
        ...Theme.typography.h2,
        marginBottom: Theme.spacing.xs,
    },
    profileSubtitle: {
        ...Theme.typography.body,
    },
    profileStatsRow: {
        flexDirection: 'row',
        marginTop: Theme.spacing.lg,
        backgroundColor: Theme.colors.surfaceDarker,
        borderRadius: Theme.layout.borderRadiusPill,
        padding: Theme.spacing.md,
        width: '100%',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    profileStat: {
        flex: 1,
        alignItems: 'center',
    },
    profileStatValue: {
        ...Theme.typography.h2,
        fontSize: 20,
    },
    profileStatLabel: {
        ...Theme.typography.caption,
        marginTop: 2,
    },
    profileStatDivider: {
        width: 1,
        backgroundColor: Theme.colors.border,
        marginVertical: 4,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    infoCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        paddingHorizontal: Theme.spacing.md,
        marginBottom: Theme.spacing.lg,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    settingsCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        paddingHorizontal: Theme.spacing.md,
        marginBottom: Theme.spacing.lg,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    versionText: {
        ...Theme.typography.body,
        fontWeight: '500',
    },
});
