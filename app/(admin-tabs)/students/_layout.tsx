import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function StudentsLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.textPrimary,
      headerTitleStyle: { fontWeight: '600' as const },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ title: 'Students' }} />
      <Stack.Screen name="[studentId]" options={{ title: 'Student Details' }} />
    </Stack>
  );
}
