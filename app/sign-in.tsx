import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GraduationCap, ShieldCheck, BookOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SignInScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSelectRole = (role: 'student' | 'teacher' | 'admin') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(`/auth/login?role=${role}` as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.title}>Welcome back.</Text>
                    <Text style={styles.subtitle}>Select your account type to continue to log in.</Text>
                </Animated.View>

                <Animated.View style={[styles.options, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => handleSelectRole('student')}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.iconCircle}>
                                <GraduationCap size={24} color="#000" />
                            </View>
                            <Text style={styles.cardTitle}>Student</Text>
                        </View>
                        <Text style={styles.cardDescription}>Access your results, stats, and classes.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => handleSelectRole('teacher')}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.iconCircle}>
                                <BookOpen size={24} color="#000" />
                            </View>
                            <Text style={styles.cardTitle}>Teacher</Text>
                        </View>
                        <Text style={styles.cardDescription}>Manage your class, attendance, and students.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => handleSelectRole('admin')}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.iconCircle}>
                                <ShieldCheck size={24} color="#000" />
                            </View>
                            <Text style={styles.cardTitle}>Principal / Admin</Text>
                        </View>
                        <Text style={styles.cardDescription}>Manage the entire platform, users, and reports.</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 60,
    },
    header: {
        marginBottom: 50,
    },
    title: {
        fontSize: 40,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: -1,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        lineHeight: 28,
        fontWeight: '400',
    },
    options: {
        gap: 16,
    },
    card: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 24,
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    cardDescription: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
    },
});
