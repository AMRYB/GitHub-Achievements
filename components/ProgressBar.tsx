import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, Spacing, FontSizes } from '@/constants/theme';

interface Props {
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
  height?: number;
}

export function ProgressBar({ value, maxValue, label, color, showPercentage = true, height = 8 }: Props) {
  const { colors } = useTheme();
  const percentage = maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;
  const barColor = color || colors.primary;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color: barColor }]}>{percentage}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.fill,
            {
              height,
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.valueText, { color: colors.textMuted }]}>
          {value.toLocaleString()} / {maxValue.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  percentage: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  track: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
  valueRow: {
    marginTop: Spacing.xs,
  },
  valueText: {
    fontSize: FontSizes.xs,
  },
});
