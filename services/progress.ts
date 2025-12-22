import { Achievement, UserAchievementProgress, SyncMetrics, TierLevel, ProgressStatus, TrackingMetric } from '@/types';
import { achievements } from '@/data/achievements';

const METRIC_MAP: Record<TrackingMetric, keyof SyncMetrics> = {
  pull_requests_merged: 'pullRequestsMerged',
  coauthored_prs_merged: 'coauthoredPrsMerged',
  repo_max_stars: 'repoMaxStars',
  discussion_answers: 'discussionAnswers',
  pr_merged_without_review: 'prMergedWithoutReview',
  sponsors_count: 'sponsorsCount',
  none: 'pullRequestsMerged', // placeholder, won't be used
};

function findCurrentTier(achievement: Achievement, value: number): TierLevel | null {
  const sortedTiers = [...achievement.tiers].sort((a, b) => b.threshold - a.threshold);
  for (const tier of sortedTiers) {
    if (value >= tier.threshold) {
      return tier.tier;
    }
  }
  return null;
}

function getNextTier(achievement: Achievement, currentTier: TierLevel | null): { tier: TierLevel; threshold: number } | null {
  if (!currentTier) {
    return achievement.tiers.length > 0
      ? { tier: achievement.tiers[0].tier, threshold: achievement.tiers[0].threshold }
      : null;
  }

  const currentIndex = achievement.tiers.findIndex((t) => t.tier === currentTier);
  if (currentIndex < achievement.tiers.length - 1) {
    const next = achievement.tiers[currentIndex + 1];
    return { tier: next.tier, threshold: next.threshold };
  }
  return null; // already at max tier
}

function determineStatus(achievement: Achievement, value: number, isUnlocked: boolean): ProgressStatus {
  if (achievement.isLegacy) return 'legacy';
  if (achievement.trackingAbility === 'manual') return 'manual_only';
  if (isUnlocked) return 'unlocked';
  if (value > 0) return 'in_progress';
  if (achievement.trackingAbility === 'partial') return 'not_enough_data';
  return 'not_enough_data';
}

export function calculateAllProgress(metrics: SyncMetrics): UserAchievementProgress[] {
  const now = new Date().toISOString();

  return achievements.map((achievement) => {
    // Manual or legacy achievements
    if (achievement.trackingAbility === 'manual' || achievement.trackingAbility === 'legacy') {
      return {
        achievementId: achievement.id,
        currentTier: null,
        currentValue: 0,
        isUnlocked: false,
        isEstimated: false,
        manualOnly: achievement.trackingAbility === 'manual',
        status: achievement.isLegacy ? 'legacy' as ProgressStatus : 'manual_only' as ProgressStatus,
        lastSyncedAt: now,
      };
    }

    // Get metric value
    const metricKey = METRIC_MAP[achievement.trackingMetric];
    const value = metrics[metricKey] || 0;

    // Determine tier
    const currentTier = findCurrentTier(achievement, value);
    const isUnlocked = currentTier !== null;
    const isEstimated = achievement.trackingAbility === 'partial';

    return {
      achievementId: achievement.id,
      currentTier,
      currentValue: value,
      isUnlocked,
      isEstimated,
      manualOnly: false,
      status: determineStatus(achievement, value, isUnlocked),
      lastSyncedAt: now,
    };
  });
}

export function getProgressPercentage(achievement: Achievement, progress: UserAchievementProgress): number {
  if (progress.manualOnly || progress.status === 'legacy') return 0;
  if (!achievement.tiers.length) return 0;

  // If unlocked, find progress to NEXT tier
  const nextTier = getNextTier(achievement, progress.currentTier);
  if (!nextTier) return 100; // max tier reached

  const currentTierIndex = progress.currentTier
    ? achievement.tiers.findIndex((t) => t.tier === progress.currentTier)
    : -1;

  const prevThreshold = currentTierIndex >= 0 ? achievement.tiers[currentTierIndex].threshold : 0;
  const nextThreshold = nextTier.threshold;
  const range = nextThreshold - prevThreshold;

  if (range <= 0) return 100;

  const valueInRange = progress.currentValue - prevThreshold;
  return Math.min(100, Math.max(0, Math.round((valueInRange / range) * 100)));
}

export function getProgressSummary(progressList: UserAchievementProgress[]) {
  const unlocked = progressList.filter((p) => p.isUnlocked).length;
  const inProgress = progressList.filter((p) => p.status === 'in_progress').length;
  const manualOnly = progressList.filter((p) => p.manualOnly).length;
  const legacy = progressList.filter((p) => p.status === 'legacy').length;
  const total = achievements.length;

  return { unlocked, inProgress, manualOnly, legacy, total };
}
