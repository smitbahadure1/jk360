import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function AdminSettingsLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.textPrimary,
      headerTitleStyle: { fontWeight: '600' as const },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
    </Stack>
  );
}
