import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ProgressStatus } from '@/types';
import { BorderRadius, FontSizes, Spacing, FontFamily } from '@/constants/theme';
import { CheckCircle2, Clock, Hand, HelpCircle, Archive, LucideIcon } from 'lucide-react-native';

interface Props {
  status: ProgressStatus;
  small?: boolean;
}

const STATUS_CONFIG: Record<ProgressStatus, { label: string; colorKey: string; Icon: LucideIcon }> = {
  unlocked: { label: 'Unlocked', colorKey: 'statusUnlocked', Icon: CheckCircle2 },
  in_progress: { label: 'In Progress', colorKey: 'statusProgress', Icon: Clock },
  manual_only: { label: 'Manual', colorKey: 'statusManual', Icon: Hand },
  not_enough_data: { label: 'No Data', colorKey: 'statusNoData', Icon: HelpCircle },
  legacy: { label: 'Legacy', colorKey: 'statusLegacy', Icon: Archive },
};

export function StatusBadge({ status, small }: Props) {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[status];
  const badgeColor = (colors as any)[config.colorKey];
  const IconProps = { size: small ? 12 : 14, color: badgeColor };

  return (
    <View
      style={[
        styles.badge,
        small && styles.badgeSmall,
        { backgroundColor: badgeColor + '18', borderColor: badgeColor + '40' },
      ]}
    >
      <config.Icon {...IconProps} />
      <Text
        style={[
          styles.text,
          small && styles.textSmall,
          { color: badgeColor, fontFamily: (Platform.OS === 'web' ? FontFamily.sans : undefined) as any },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 10,
  },
});
