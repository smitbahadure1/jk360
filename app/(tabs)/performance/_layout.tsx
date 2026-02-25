import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function PerformanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' as const, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Performance' }} />
    </Stack>
  );
}
