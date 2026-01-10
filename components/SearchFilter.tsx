import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';

interface Props {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  filters: { key: string; label: string }[];
}

export function SearchFilter({ searchQuery, onSearchChange, selectedFilter, onFilterChange, filters }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.surfaceSecondary,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder="Search achievements..."
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedFilter === filter.key ? colors.primary : colors.surfaceSecondary,
                borderColor:
                  selectedFilter === filter.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: selectedFilter === filter.key ? '700' : '500',
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  searchInput: {
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FontSizes.sm,
  },
});
