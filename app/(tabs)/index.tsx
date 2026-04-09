import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { achievements } from '@/data/achievements';
import { AchievementCard } from '@/components/AchievementCard';
import { SearchFilter } from '@/components/SearchFilter';
import { FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { TouchableOpacity } from 'react-native';
import { Trophy, Sun, Moon, Settings } from 'lucide-react-native';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'earnable', label: 'Earnable' },
  { key: 'legacy', label: 'Legacy' },
  { key: 'contribution', label: 'Contribution' },
  { key: 'community', label: 'Community' },
  { key: 'profile', label: 'Profile' },
  { key: 'special', label: 'Special' },
];

export default function CatalogScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  const { progress } = useAuth();
  const { query } = useSearch();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

  const filtered = useMemo(() => {
    let result = [...achievements];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    if (selectedFilter === 'earnable') {
      result = result.filter((a) => a.isEarnable && !a.isLegacy);
    } else if (selectedFilter === 'legacy') {
      result = result.filter((a) => a.isLegacy);
    } else if (selectedFilter !== 'all') {
      result = result.filter((a) => a.category === selectedFilter);
    }

    return result;
  }, [query, selectedFilter]);

  const getProgressForAchievement = (achievementId: string) => {
    return progress.find((p) => p.achievementId === achievementId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchFilter
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filters={FILTERS}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        renderItem={({ item }) => {
          const prog = getProgressForAchievement(item.id);
          return (
            <View style={numColumns > 1 ? { flex: 1, maxWidth: `${100 / numColumns}%` } : undefined}>
              <AchievementCard
                achievement={item}
                onPress={() => router.push(`/achievement/${item.id}`)}
                progress={
                  prog
                    ? {
                        status: prog.status,
                        currentTier: prog.currentTier,
                        currentValue: prog.currentValue,
                      }
                    : undefined
                }
              />
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No achievements match your search.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    marginTop: -4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnWrapper: {
    gap: Spacing.md,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
});
