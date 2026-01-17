import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AchievementTier } from '@/types';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';

interface Props {
  tier: AchievementTier;
  isActive?: boolean;
}

export function TierBadge({ tier, isActive = false }: Props) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isActive ? tier.iconColor + '30' : tier.iconColor + '10',
          borderColor: isActive ? tier.iconColor : tier.iconColor + '40',
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: tier.iconColor },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            color: tier.iconColor,
            fontWeight: isActive ? '700' : '500',
          },
        ]}
      >
        {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSizes.xs,
  },
});
