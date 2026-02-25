import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutDashboard, Users, CheckCircle, Settings } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { AdminProvider } from '@/contexts/AdminContext';

export default function TeacherTabLayout() {
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
                    name="teacher-dashboard/index"
                    options={{
                        title: 'Overview',
                        tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="attendance/index"
                    options={{
                        title: 'Attendance',
                        tabBarIcon: ({ color, size }) => <CheckCircle size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="students/index"
                    options={{
                        title: 'Class List',
                        tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="teacher-settings/index"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
                    }}
                />
            </Tabs>
        </AdminProvider>
    );
}
