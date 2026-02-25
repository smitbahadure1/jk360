import React, { useState, useMemo, useEffect } from 'react';
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
import { Search, ChevronRight, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { Student } from '@/types/student';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TeacherStudentsListScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [assignedClass, setAssignedClass] = useState('');
    const [assignedSection, setAssignedSection] = useState('');

    const { students } = useAdmin();
    const { userId } = useAuth();

    useEffect(() => {
        loadAssignment();
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

    const filtered = useMemo(() => {
        let list = myStudents;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (s) =>
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                    s.rollNumber.toLowerCase().includes(q)
            );
        }
        return list;
    }, [searchQuery, myStudents]);

    const onRefresh = () => {
        setRefreshing(true);
        loadAssignment().finally(() => setRefreshing(false));
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
                        Roll #{item.rollNumber}
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
                        placeholder="Search class roster..."
                        placeholderTextColor={Theme.colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
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
                        <Text style={styles.emptySubtitle}>You don't have any students enrolled yet.</Text>
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
        paddingTop: Theme.spacing.xxxl,
        paddingBottom: Theme.spacing.md,
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
