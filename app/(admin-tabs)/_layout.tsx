import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutDashboard, Users, ClipboardList, Settings } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { AdminProvider } from '@/contexts/AdminContext';

export default function AdminTabLayout() {
    return (
        <AdminProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: Theme.colors.primary,
                    tabBarInactiveTintColor: Theme.colors.textTertiary,
                    tabBarStyle: {
                        backgroundColor: Theme.colors.background,
                        borderTopColor: Theme.colors.border,
                        borderTopWidth: 1,
                        elevation: 0,
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
                    name="admin-dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="students"
                    options={{
                        title: 'Students',
                        tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="admin-results"
                    options={{
                        title: 'Results',
                        tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="admin-settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
                    }}
                />
            </Tabs>
        </AdminProvider>
    );
}
