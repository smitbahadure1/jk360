import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

export default function Index() {
    const { isAuthenticated, role, hasSeenOnboarding, isReady } = useAuth();

    if (!isReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!hasSeenOnboarding) {
        return <Redirect href={"/onboarding" as any} />;
    }

    if (!isAuthenticated) {
        return <Redirect href={"/sign-in" as any} />;
    }

    if (role === 'admin') {
        return <Redirect href={"/(admin-tabs)/admin-dashboard" as any} />;
    }

    if (role === 'teacher') {
        return <Redirect href={"/(teacher-tabs)/teacher-dashboard" as any} />;
    }

    return <Redirect href={"/(tabs)/dashboard" as any} />;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
    },
});
