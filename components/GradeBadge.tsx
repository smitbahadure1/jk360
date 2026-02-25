import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGradeColor } from '@/types/student';

interface GradeBadgeProps {
  grade: string;
  size?: 'small' | 'medium' | 'large';
}

export default function GradeBadge({ grade, size = 'medium' }: GradeBadgeProps) {
  const color = getGradeColor(grade);
  const sizeStyles = {
    small: { paddingH: 8, paddingV: 3, fontSize: 11 },
    medium: { paddingH: 12, paddingV: 5, fontSize: 13 },
    large: { paddingH: 16, paddingV: 8, fontSize: 16 },
  };
  const s = sizeStyles[size];

  return (
    <View style={[styles.badge, {
      backgroundColor: color + '18',
      paddingHorizontal: s.paddingH,
      paddingVertical: s.paddingV,
    }]}>
      <Text style={[styles.text, { color, fontSize: s.fontSize }]}>{grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700' as const,
  },
});
