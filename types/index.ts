// ============================================
// GitHub Achievements Tracker — Type Definitions
// ============================================

export type AchievementCategory = 'contribution' | 'community' | 'profile' | 'special';

export type TierLevel = 'default' | 'bronze' | 'silver' | 'gold';

export type TrackingMetric =
  | 'pull_requests_merged'
  | 'coauthored_prs_merged'
  | 'repo_max_stars'
  | 'discussion_answers'
  | 'pr_merged_without_review'
  | 'sponsors_count'
  | 'none';

export type TrackingAbility = 'auto' | 'partial' | 'manual' | 'legacy';

export type AutoEarnMethod =
  | 'create_pr_and_merge'
  | 'create_coauthored_pr'
  | 'create_pr_no_review'
  | 'create_and_close_issue'
  | 'react_heart'
  | 'none';

export interface AchievementTier {
  tier: TierLevel;
  label: string;
  threshold: number;
  iconColor: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  category: AchievementCategory;
  isEarnable: boolean;
  isLegacy: boolean;
  howToEarn: string;
  notes: string;
  trackingAbility: TrackingAbility;
  trackingMetric: TrackingMetric;
  canAutoEarn: boolean;
  autoEarnMethod: AutoEarnMethod;
  autoEarnLabel: string;
  tiers: AchievementTier[];
}

export type ProgressStatus = 'unlocked' | 'in_progress' | 'manual_only' | 'not_enough_data' | 'legacy';

export interface UserAchievementProgress {
  achievementId: string;
  currentTier: TierLevel | null;
  currentValue: number;
  isUnlocked: boolean;
  isEstimated: boolean;
  manualOnly: boolean;
  status: ProgressStatus;
  lastSyncedAt: string | null;
}

export interface GitHubProfile {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  status?: {
    emoji: string | null;
    message: string | null;
  } | null;
}

export interface SyncMetrics {
  pullRequestsMerged: number;
  coauthoredPrsMerged: number;
  repoMaxStars: number;
  discussionAnswers: number;
  prMergedWithoutReview: number;
  sponsorsCount: number;
}

export interface SyncResult {
  profile: GitHubProfile;
  metrics: SyncMetrics;
  syncedAt: string;
  errors: string[];
  rateLimitRemaining: number;
}

export interface SyncJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  metrics: SyncMetrics | null;
}

export interface StoredUserData {
  profile: GitHubProfile | null;
  token: string | null;
  progress: UserAchievementProgress[];
  lastSync: SyncResult | null;
  syncHistory: SyncJob[];
}

export interface ActionResult {
  success: boolean;
  message: string;
  url?: string;
}
