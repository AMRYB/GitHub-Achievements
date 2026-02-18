import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { achievements } from '@/data/achievements';
import { getProgressSummary, getProgressPercentage } from '@/services/progress';
import { DashboardCard } from '@/components/DashboardCard';
import { AchievementCard } from '@/components/AchievementCard';
import { ProgressBar } from '@/components/ProgressBar';
import { ActionButton } from '@/components/ActionButton';
import { FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { Lock, Settings, RefreshCw, CheckCircle, Clock, Hand, Trophy, LineChart } from 'lucide-react-native';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, profile, progress, lastSync, isSyncing, syncError, sync } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Lock size={64} color={colors.textMuted} style={{ marginBottom: Spacing.xl }} />
        <Text style={[styles.title, { color: colors.text }]}>Connect GitHub</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }]}>
          Add your GitHub Personal Access Token to track your achievement progress.
        </Text>
        <ActionButton
          title="Go to Settings"
          Icon={Settings}
          onPress={() => router.push('/settings')}
        />
      </View>
    );
  }

  const summary = getProgressSummary(progress);

  const handleSync = async () => {
    try {
      await sync();
      if (Platform.OS !== 'web') {
        Alert.alert('Sync Complete', 'Your achievements have been updated!');
      }
    } catch (error) {
      // Error is already stored in syncError
    }
  };

  const trackableAchievements = achievements.filter(
    (a) => a.trackingAbility === 'auto' || a.trackingAbility === 'partial'
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      {profile && (
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>@{profile.username}</Text>
            {profile.bio ? (
              <Text style={[styles.profileBio, { color: colors.textMuted }]} numberOfLines={2}>
                {profile.bio}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Sync Button */}
      <View style={styles.syncRow}>
        <ActionButton
          title={isSyncing ? 'Syncing...' : 'Sync GitHub Data'}
          Icon={RefreshCw}
          onPress={handleSync}
          isLoading={isSyncing}
          variant="primary"
        />
        {lastSync && (
          <Text style={[styles.syncInfo, { color: colors.textMuted }]}>
            Last sync: {new Date(lastSync.syncedAt).toLocaleString()}
          </Text>
        )}
        {syncError && (
          <Text style={[styles.syncError, { color: colors.error }]}>{syncError}</Text>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <DashboardCard title="Unlocked" value={summary.unlocked} Icon={CheckCircle} color={colors.statusUnlocked} />
        <DashboardCard title="In Progress" value={summary.inProgress} Icon={Clock} color={colors.statusProgress} />
      </View>
      <View style={styles.statsRow}>
        <DashboardCard title="Manual" value={summary.manualOnly} Icon={Hand} color={colors.statusManual} />
        <DashboardCard title="Total" value={summary.total} Icon={Trophy} color={colors.primary} />
      </View>

      {/* Progress Section */}
      {progress.length > 0 && (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg }}>
            <LineChart size={24} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Trackable Progress</Text>
          </View>
          {trackableAchievements.map((achievement) => {
            const prog = progress.find((p) => p.achievementId === achievement.id);
            if (!prog) return null;

            const nextTier = achievement.tiers.find(
              (t) => t.threshold > prog.currentValue
            );
            const currentTier = [...achievement.tiers]
              .reverse()
              .find((t) => prog.currentValue >= t.threshold);

            return (
              <View
                key={achievement.id}
                style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={styles.progressHeader}>
                  <Image source={{ uri: achievement.imageUrl }} style={{ width: 32, height: 32 }} resizeMode="contain" />
                  <View style={styles.progressMeta}>
                    <Text style={[styles.progressName, { color: colors.text }]}>{achievement.name}</Text>
                    {currentTier && (
                      <Text style={[styles.currentTierText, { color: currentTier.iconColor }]}>
                        {currentTier.label}
                      </Text>
                    )}
                  </View>
                </View>
                {nextTier ? (
                  <ProgressBar
                    value={prog.currentValue}
                    maxValue={nextTier.threshold}
                    label={`Next: ${nextTier.label}`}
                    color={nextTier.iconColor}
                  />
                ) : (
                  <View style={[styles.maxTierBadge, { backgroundColor: colors.statusUnlocked + '15' }]}>
                    <Text style={[styles.maxTierText, { color: colors.statusUnlocked }]}>
                      ✨ Max tier achieved!
                    </Text>
                  </View>
                )}
                {prog.isEstimated && (
                  <Text style={[styles.estimatedNote, { color: colors.warning }]}>
                    ⚠️ Estimated — may not be fully accurate
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  profileUsername: {
    fontSize: FontSizes.sm,
  },
  profileBio: {
    fontSize: FontSizes.xs,
    marginTop: 4,
  },
  syncRow: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  syncInfo: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  syncError: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  progressCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressMeta: {
    flex: 1,
  },
  progressName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  currentTierText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  maxTierBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  maxTierText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  estimatedNote: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
  },
});
