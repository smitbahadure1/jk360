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
    LogOut,
    ChevronRight,
    Moon,
    User,
    Mail,
    Phone,
    GraduationCap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminSettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { adminProfile } = useAdmin();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = () => {
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
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {adminProfile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>{adminProfile.name}</Text>
                    <Text style={styles.profileSubtitle}>{adminProfile.role} • {adminProfile.school}</Text>
                </View>

                <Text style={styles.sectionTitle}>Account Details</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon={<User size={18} color={Theme.colors.textPrimary} />} label="Name" value={adminProfile.name} />
                    <InfoRow icon={<GraduationCap size={18} color={Theme.colors.textPrimary} />} label="Role" value={adminProfile.role} />
                    <InfoRow icon={<Mail size={18} color={Theme.colors.textPrimary} />} label="Email" value={adminProfile.email} />
                    <InfoRow icon={<Phone size={18} color={Theme.colors.success} />} label="Phone" value={adminProfile.phone} isLast />
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

                <Text style={styles.sectionTitle}>Sessions</Text>
                <View style={styles.settingsCard}>
                    <SettingsRow
                        icon={<LogOut size={20} color={Theme.colors.danger} />}
                        label="Sign Out"
                        labelColor={Theme.colors.danger}
                        onPress={handleLogout}
                    />
                </View>

                <View style={{ height: Theme.spacing.xxxl }} />
            </ScrollView>
        </View>
    );
}

function InfoRow({ icon, label, value, isLast }: { icon: React.ReactNode; label: string; value: string; isLast?: boolean }) {
    return (
        <View style={[infoStyles.row, isLast && { borderBottomWidth: 0 }]}>
            <View style={infoStyles.iconWrap}>{icon}</View>
            <View style={infoStyles.content}>
                <Text style={infoStyles.label}>{label}</Text>
                <Text style={infoStyles.value}>{value}</Text>
            </View>
        </View>
    );
}

const infoStyles = StyleSheet.create({
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

function SettingsRow({ icon, label, labelColor, right, onPress }: {
    icon: React.ReactNode;
    label: string;
    labelColor?: string;
    right?: React.ReactNode;
    onPress?: () => void;
}) {
    const content = (
        <View style={settingsStyles.row}>
            <View style={settingsStyles.iconWrap}>{icon}</View>
            <Text style={[settingsStyles.label, labelColor ? { color: labelColor } : null]}>{label}</Text>
            {right && <View style={settingsStyles.right}>{right}</View>}
        </View>
    );

    if (onPress) {
        return <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{content}</TouchableOpacity>;
    }
    return content;
}

const settingsStyles = StyleSheet.create({
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
