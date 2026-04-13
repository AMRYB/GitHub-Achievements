import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Achievement } from '@/types';
import { executeAction } from '@/services/actions';
import { BorderRadius, FontSizes, Spacing, FontFamily } from '@/constants/theme';
import { StatusBadge } from './StatusBadge';
import { TierBadge } from './TierBadge';

interface Props {
  achievement: Achievement;
  onPress: () => void;
  progress?: {
    status: string;
    currentTier: string | null;
    currentValue: number;
  };
}

export function AchievementCard({ achievement, onPress, progress }: Props) {
  const { colors } = useTheme();
  const { token, profile } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const handleAction = async () => {
    if (!token || !profile || !achievement.canAutoEarn) return;
    setIsRunning(true);
    setActionMsg('');
    try {
      const result = await executeAction(achievement.autoEarnMethod, profile.username, token);
      setActionMsg(result.message);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

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
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardContent}>
        {/* Badge Image */}
        <View style={styles.header}>
          <Image
            source={{ uri: achievement.imageUrl }}
            style={styles.badgeImage}
            resizeMode="contain"
          />
          <View style={styles.headerRight}>
            {!achievement.isEarnable && <StatusBadge status="legacy" />}
            {achievement.trackingAbility === 'manual' && progress?.status !== 'unlocked' && (
              <StatusBadge status="manual_only" />
            )}
            {progress?.status === 'unlocked' && <StatusBadge status="unlocked" />}
            {progress?.status === 'in_progress' && <StatusBadge status="in_progress" />}
          </View>
        </View>

        <Text style={[styles.name, { color: colors.text, fontFamily: (Platform.OS === 'web' ? FontFamily.sans : undefined) as any }]}>
          {achievement.name}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {achievement.description}
        </Text>

        {achievement.tiers.length > 1 && (
          <View style={styles.tiers}>
            {achievement.tiers.map((tier) => (
              <TierBadge
                key={tier.tier}
                tier={tier}
                isActive={progress?.currentTier === tier.tier}
              />
            ))}
          </View>
        )}

        {progress && progress.currentValue > 0 && (
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {progress.currentValue.toLocaleString()} earned
          </Text>
        )}
      </TouchableOpacity>

      {/* Action Button */}
      {achievement.canAutoEarn && token && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            onPress={handleAction}
            disabled={isRunning}
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.btnPrimary,
                opacity: isRunning ? 0.7 : 1,
              },
            ]}
          >
            {isRunning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>{achievement.autoEarnLabel}</Text>
            )}
          </TouchableOpacity>
          {actionMsg ? (
            <Text
              style={[
                styles.actionMsg,
                { color: actionMsg.startsWith('Error') ? colors.error : colors.success },
              ]}
              numberOfLines={2}
            >
              {actionMsg}
            </Text>
          ) : null}
        </View>
      )}

      {/* Non-automatable message */}
      {!achievement.canAutoEarn && achievement.isEarnable && !achievement.isLegacy && (
        <View style={[styles.manualNote, { borderTopColor: colors.border }]}>
          <Text style={[styles.manualNoteText, { color: colors.textMuted }]}>
            {achievement.autoEarnLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  badgeImage: {
    width: 64,
    height: 64,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '50%',
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  tiers: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  progressText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  actionMsg: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  manualNote: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  manualNoteText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
