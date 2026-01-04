import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { LucideIcon, BarChart2 } from 'lucide-react-native';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  Icon?: LucideIcon;
  color?: string;
}

export function DashboardCard({ title, value, subtitle, Icon = BarChart2, color }: Props) {
  const { colors } = useTheme();
  const accentColor = color || colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
        <Icon size={22} color={accentColor} />
      </View>
      <Text style={[styles.value, { color: accentColor }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    marginBottom: 2,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});
