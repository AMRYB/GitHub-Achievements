import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface Props {
  title: string;
  Icon?: LucideIcon;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ActionButton({ title, Icon, onPress, variant = 'primary', isLoading, disabled, style }: Props) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.surfaceSecondary, borderColor: colors.border };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.border };
      case 'danger':
        return { backgroundColor: colors.error + '15', borderColor: colors.error + '40' };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.text;
      case 'danger':
        return colors.error;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {Icon && <Icon size={18} color={getTextColor()} />}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  text: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
