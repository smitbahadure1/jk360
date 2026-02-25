import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    FlatList,
    ViewToken,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, LineChart, Award, BellRing } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const SLIDES: OnboardingSlide[] = [
    {
        id: '1',
        icon: <BookOpen size={42} color="#000" strokeWidth={1} />,
        title: 'Academics.',
        subtitle: 'All your academic progress mapped out simply in one place.',
    },
    {
        id: '2',
        icon: <LineChart size={42} color="#000" strokeWidth={1} />,
        title: 'Analytics.',
        subtitle: 'Clear, concise data on your strengths and areas to grow.',
    },
    {
        id: '3',
        icon: <Award size={42} color="#000" strokeWidth={1} />,
        title: 'Results.',
        subtitle: 'Immediate access to exam scores as soon as they are ready.',
    },
    {
        id: '4',
        icon: <BellRing size={42} color="#000" strokeWidth={1} />,
        title: 'Updates.',
        subtitle: 'Stay quietly informed about what actually matters.',
    },
];

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { completeOnboarding } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<Animated.FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index != null) {
            setCurrentIndex(viewableItems[0].index);
            if (Platform.OS === 'ios') Haptics.selectionAsync();
        }
    }, []);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentIndex < SLIDES.length - 1) {
            // Use 'any' type cast here for the ref because Animated.FlatList types can be tricky
            (flatListRef.current as any)?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            completeOnboarding();
            router.replace('/sign-in' as any);
        }
    }, [currentIndex, completeOnboarding, router]);

    const handleSkip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        completeOnboarding();
        router.replace('/sign-in' as any);
    }, [completeOnboarding, router]);

    const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
        const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [20, 0, -20],
            extrapolate: 'clamp',
        });

        return (
            <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
                <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
                    <View style={styles.iconContainer}>
                        {item.icon}
                    </View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </Animated.View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View />
                {currentIndex < SLIDES.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false } // Width and background interpolations require false
                )}
                scrollEventThrottle={16}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];

                        const width = scrollX.interpolate({
                            inputRange,
                            outputRange: [6, 24, 6],
                            extrapolate: 'clamp',
                        });

                        const backgroundColor = scrollX.interpolate({
                            inputRange,
                            outputRange: ['#E5E7EB', '#000000', '#E5E7EB'], // Gray-200 to Black
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i}
                                style={[styles.dot, { width, backgroundColor }]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDES.length - 1 ? 'Start setup' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingTop: 16,
        height: 60,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '400',
        color: '#9CA3AF', // Gray-400
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 40,
        alignItems: 'flex-start',
        width: '100%',
        paddingBottom: 80, // Offset physically upwards towards the middle
    },
    iconContainer: {
        marginBottom: 48,
    },
    title: {
        fontSize: 48,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 16,
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280', // Gray-500
        lineHeight: 28,
        fontWeight: '400',
        letterSpacing: -0.2,
        maxWidth: '90%',
    },
    footer: {
        paddingHorizontal: 28,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        gap: 6,
        paddingHorizontal: 4,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    button: {
        backgroundColor: '#000000',
        height: 56,
        borderRadius: 28, // Pill shape
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});
