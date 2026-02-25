import { Tabs } from 'expo-router';
import React from 'react';
import { Home, ClipboardList, TrendingUp, User } from 'lucide-react-native';
import { Theme } from '@/constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: Theme.colors.background,
                    borderTopColor: Theme.colors.border,
                    borderTopWidth: 1,
                    elevation: 0, // completely flat sticky bottom
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: -2 },
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500' as const,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="results"
                options={{
                    title: 'Results',
                    tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="performance"
                options={{
                    title: 'Performance',
                    tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
