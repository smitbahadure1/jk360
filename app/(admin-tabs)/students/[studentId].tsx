import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Hash,
} from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { useAdmin } from '@/contexts/AdminContext';

export default function StudentDetailScreen() {
    const { studentId } = useLocalSearchParams<{ studentId: string }>();
    const { students, results } = useAdmin();
    const student = students.find((s) => s.id === studentId);
    const studentResults = results.filter((r) => r.studentId === studentId);

    if (!student) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Student Details' }} />
                <Text style={styles.errorText}>Student not found</Text>
            </View>
        );
    }

    const initials = `${student.firstName[0]}${student.lastName[0]}`;
    const avgPct = studentResults.length > 0
        ? Math.round((studentResults.reduce((s, r) => s + r.percentage, 0) / studentResults.length) * 10) / 10
        : 0;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: `${student.firstName} ${student.lastName}` }} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.profileName}>{student.firstName} {student.lastName}</Text>
                    <Text style={styles.profileSubtitle}>{student.className} • Section {student.section}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{studentResults.length}</Text>
                            <Text style={styles.statLabel}>Exams</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{avgPct}%</Text>
                            <Text style={styles.statLabel}>Average</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{student.rollNumber}</Text>
                            <Text style={styles.statLabel}>Roll No.</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon={<Hash size={18} color={Theme.colors.textPrimary} />} label="Roll Number" value={student.rollNumber} />
                    <InfoRow icon={<Calendar size={18} color={Theme.colors.textPrimary} />} label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
                    <InfoRow icon={<User size={18} color={Theme.colors.textPrimary} />} label="Gender" value={student.gender} />
                    <InfoRow icon={<Mail size={18} color={Theme.colors.textPrimary} />} label="Email" value={student.email} />
                    <InfoRow icon={<Phone size={18} color={Theme.colors.textPrimary} />} label="Phone" value={student.phone} />
                    <InfoRow icon={<MapPin size={18} color={Theme.colors.textPrimary} />} label="Address" value={student.address} isLast />
                </View>

                <Text style={styles.sectionTitle}>Guardian Information</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon={<User size={18} color={Theme.colors.textPrimary} />} label="Guardian Name" value={student.guardianName} />
                    <InfoRow icon={<Phone size={18} color={Theme.colors.textPrimary} />} label="Guardian Phone" value={student.guardianPhone} isLast />
                </View>

                {studentResults.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Exam Results</Text>
                        {studentResults.map((result) => (
                            <View key={result.id} style={styles.resultCard}>
                                <View style={styles.resultTop}>
                                    <View>
                                        <Text style={styles.resultExam}>{result.examName}</Text>
                                        <Text style={styles.resultDate}>
                                            {new Date(result.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                    </View>
                                    <View style={styles.gradeBadgeMinimal}>
                                        <Text style={styles.gradeBadgeMinimalText}>{result.grade}</Text>
                                    </View>
                                </View>
                                <View style={styles.resultStats}>
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>Score</Text>
                                        <Text style={styles.resultStatValue}>{result.totalMarks}/{result.totalMaxMarks}</Text>
                                    </View>
                                    <View style={styles.resultStatDivider} />
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>Percentage</Text>
                                        <Text style={[styles.resultStatValue, { color: Theme.colors.success }]}>{result.percentage}%</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                <View style={{ height: 40 }} />
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
        width: 36,
        height: 36,
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
        fontSize: 15,
        marginTop: 2,
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
    },
    errorText: {
        ...Theme.typography.bodyLarge,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 60,
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
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.sm,
    },
    avatarText: {
        ...Theme.typography.h1,
        color: Theme.colors.background,
    },
    profileName: {
        ...Theme.typography.h2,
    },
    profileSubtitle: {
        ...Theme.typography.body,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.layout.borderRadiusIcon,
        padding: Theme.spacing.md,
        width: '100%',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...Theme.typography.h3,
    },
    statLabel: {
        ...Theme.typography.caption,
        marginTop: 3,
    },
    statDivider: {
        width: 1,
        backgroundColor: Theme.colors.border,
        marginVertical: 4,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        marginBottom: Theme.spacing.sm,
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
    resultCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    resultTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.sm,
    },
    resultExam: {
        ...Theme.typography.h3,
    },
    resultDate: {
        ...Theme.typography.caption,
        marginTop: 3,
    },
    gradeBadgeMinimal: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradeBadgeMinimalText: {
        ...Theme.typography.h3,
        color: Theme.colors.background,
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
        marginVertical: 2,
    },
});
