import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { role } = useLocalSearchParams<{ role: string }>();
    const { signIn, signUp, isSigningIn } = useAuth();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const displayRole = role === 'admin'
        ? 'Principal / Admin'
        : role === 'teacher'
            ? 'Teacher'
            : 'Student';

    const handleAction = async () => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password;

        if (!cleanEmail || !cleanPass) {
            Alert.alert('Error', 'Please enter email and password.');
            return;
        }

        if (mode === 'signup' && !name.trim()) {
            Alert.alert('Error', 'Please enter your full name.');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (mode === 'signup') {
            const success = await signUp(cleanEmail, cleanPass, name.trim(), role as any);
            if (success) setMode('signin');
        } else {
            const success = await signIn(cleanEmail, cleanPass, role as any);
            if (success) {
                if (role === 'student') router.replace('/(tabs)/dashboard' as any);
                else if (role === 'teacher') router.replace('/(teacher-tabs)/teacher-dashboard' as any);
                else router.replace('/(admin-tabs)/admin-dashboard' as any);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{mode === 'signin' ? 'Log In' : 'Sign Up'}</Text>
                    <Text style={styles.subtitle}>
                        {mode === 'signin'
                            ? `Continuing as ${displayRole}`
                            : 'Create your student account'}
                    </Text>

                    <View style={styles.form}>
                        {mode === 'signup' && (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, { paddingLeft: 32 }]}
                                    placeholder="Full Name"
                                    placeholderTextColor={Theme.colors.textTertiary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}
                        <View style={styles.inputContainer}>
                            <Mail size={20} color={Theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={Theme.colors.textTertiary}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock size={20} color={Theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={Theme.colors.textTertiary}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.loginBtn, isSigningIn && styles.loginBtnDisabled]}
                            onPress={handleAction}
                            activeOpacity={0.8}
                            disabled={isSigningIn}
                        >
                            {isSigningIn ? (
                                <ActivityIndicator color={Theme.colors.background} />
                            ) : (
                                <Text style={styles.loginBtnText}>
                                    {mode === 'signin' ? 'Sign In' : 'Register Now'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {role === 'student' && (
                            <TouchableOpacity
                                style={styles.toggleBtn}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setMode(mode === 'signin' ? 'signup' : 'signin');
                                }}
                            >
                                <Text style={styles.toggleText}>
                                    {mode === 'signin'
                                        ? "Don't have an account? Sign Up"
                                        : "Already have an account? Sign In"}
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.sm,
        paddingBottom: Theme.spacing.lg,
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
    content: {
        flex: 1,
        paddingHorizontal: Theme.spacing.xl,
    },
    title: {
        ...Theme.typography.h1,
        fontSize: 40,
        marginBottom: 8,
    },
    subtitle: {
        ...Theme.typography.bodyLarge,
        color: Theme.colors.textSecondary,
        marginBottom: 40,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        paddingHorizontal: 16,
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        ...Theme.typography.bodyLarge,
        color: Theme.colors.textPrimary,
    },
    loginBtn: {
        backgroundColor: Theme.colors.primary,
        height: 60,
        borderRadius: Theme.layout.borderRadiusPill,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    loginBtnDisabled: {
        backgroundColor: Theme.colors.textTertiary,
    },
    loginBtnText: {
        ...Theme.typography.h3,
        color: Theme.colors.background,
    },
    dividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Theme.colors.border,
    },
    dividerText: {
        ...Theme.typography.body,
        marginHorizontal: 16,
        color: Theme.colors.textTertiary,
    },
    googleBtn: {
        backgroundColor: Theme.colors.surface,
        height: 60,
        borderRadius: Theme.layout.borderRadiusPill,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    googleBtnText: {
        ...Theme.typography.h3,
        color: Theme.colors.textPrimary,
    },
    toggleBtn: {
        marginTop: 10,
        alignItems: 'center',
        padding: 10,
    },
    toggleText: {
        ...Theme.typography.body,
        color: Theme.colors.primary,
        fontWeight: '600',
    },
});
