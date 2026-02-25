import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, Users, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { Student } from '@/types/student';
import { useAdmin } from '@/contexts/AdminContext';

export default function StudentsListScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const { students } = useAdmin();

    const classFilters = useMemo(() => {
        const classes = new Set(students.map((s) => s.className));
        return Array.from(classes).sort();
    }, [students]);

    const filtered = useMemo(() => {
        let list = students;
        if (selectedClass) {
            list = list.filter((s) => s.className === selectedClass);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (s) =>
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                    s.rollNumber.toLowerCase().includes(q)
            );
        }
        return list;
    }, [searchQuery, selectedClass, students]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    const renderStudent = ({ item }: { item: Student }) => {
        const initials = `${item.firstName[0]}${item.lastName[0]}`;

        return (
            <TouchableOpacity
                style={styles.studentCard}
                activeOpacity={0.7}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/students/${item.id}` as any);
                }}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.studentMeta}>
                        {item.className} • Section {item.section} • Roll #{item.rollNumber}
                    </Text>
                </View>
                <ChevronRight size={18} color={Theme.colors.textTertiary} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={Theme.colors.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
                        placeholderTextColor={Theme.colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filtersRow}>
                <TouchableOpacity
                    style={[styles.filterChip, !selectedClass && styles.filterChipActive]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedClass(null);
                    }}
                >
                    <Text style={[styles.filterChipText, !selectedClass && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                {classFilters.map((cls) => (
                    <TouchableOpacity
                        key={cls}
                        style={[styles.filterChip, selectedClass === cls && styles.filterChipActive]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedClass(selectedClass === cls ? null : cls);
                        }}
                    >
                        <Text style={[styles.filterChipText, selectedClass === cls && styles.filterChipTextActive]}>
                            {cls}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.countRow}>
                <Users size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.countText}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</Text>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderStudent}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Users size={40} color={Theme.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>No Students Found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
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
    searchContainer: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xs,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusPill,
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
        gap: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    searchInput: {
        flex: 1,
        ...Theme.typography.bodyLarge,
        padding: 0,
        color: Theme.colors.textPrimary,
    },
    filtersRow: {
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
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingBottom: Theme.spacing.md,
    },
    countText: {
        ...Theme.typography.body,
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingBottom: Theme.spacing.xxxl,
    },
    studentCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        padding: Theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
        ...Theme.shadows.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
    },
    avatarText: {
        ...Theme.typography.h2,
        color: Theme.colors.background,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        ...Theme.typography.bodyLarge,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginBottom: 2,
    },
    studentMeta: {
        ...Theme.typography.caption,
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
