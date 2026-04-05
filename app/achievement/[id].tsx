import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Platform, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getAchievementById } from '@/data/achievements';
import { getProgressPercentage } from '@/services/progress';
import { executeAction } from '@/services/actions';
import { TierBadge } from '@/components/TierBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { FontSizes, Spacing, BorderRadius, FontFamily } from '@/constants/theme';
import { Zap, CheckCircle2, Trophy, AlertTriangle } from 'lucide-react-native';

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { progress, token, profile } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const achievement = getAchievementById(id);

  if (!achievement) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Achievement not found</Text>
      </View>
    );
  }

  const userProgress = progress.find((p) => p.achievementId === achievement.id);
  const nextTier = achievement.tiers.find(
    (t) => !userProgress || t.threshold > (userProgress.currentValue || 0)
  );

  const handleAction = async () => {
    if (!token || !profile || !achievement.canAutoEarn) return;
    setIsRunning(true);
    setActionMsg('');
    try {
      const result = await executeAction(achievement.autoEarnMethod, profile.username, token);
      setActionMsg(result.message);
      if (result.url) {
        setTimeout(() => Linking.openURL(result.url!), 1500);
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const fontFamily = (Platform.OS === 'web' ? FontFamily.sans : undefined) as any;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image
          source={{ uri: achievement.imageUrl }}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <Text style={[styles.name, { color: colors.text, fontFamily }]}>{achievement.name}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{achievement.description}</Text>
        <View style={styles.badges}>
          {!achievement.isEarnable && <StatusBadge status="legacy" />}
          {achievement.trackingAbility === 'manual' && <StatusBadge status="manual_only" />}
          {userProgress?.status === 'unlocked' && <StatusBadge status="unlocked" />}
          {userProgress?.status === 'in_progress' && <StatusBadge status="in_progress" />}
        </View>
      </View>

      {/* Action Button */}
      {achievement.canAutoEarn && token && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
            <Zap size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily, marginBottom: 0 }]}>Earn This Badge</Text>
          </View>
          <TouchableOpacity
            onPress={handleAction}
            disabled={isRunning}
            style={[styles.bigActionBtn, { backgroundColor: colors.btnPrimary }]}
          >
            {isRunning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.bigActionBtnText, { fontFamily }]}>{achievement.autoEarnLabel}</Text>
            )}
          </TouchableOpacity>
          {actionMsg ? (
            <Text style={[styles.actionMsg, {
              color: actionMsg.startsWith('Error') ? colors.error : colors.success
            }]}>{actionMsg}</Text>
          ) : null}
        </View>
      )}

      {!achievement.canAutoEarn && achievement.isEarnable && !achievement.isLegacy && (
        <View style={[styles.section, { backgroundColor: colors.dangerBg, borderColor: colors.border }]}>
          <Text style={[styles.manualWarning, { color: colors.textSecondary }]}>
            {achievement.autoEarnLabel}
          </Text>
        </View>
      )}

      {/* How to Earn */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily }]}>How to Earn</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{achievement.howToEarn}</Text>
      </View>

      {/* Tiers */}
      {achievement.tiers.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily }]}>Tiers</Text>
          {achievement.tiers.map((tier) => (
            <View key={tier.tier} style={[styles.tierRow, { borderBottomColor: colors.border }]}>
              <TierBadge tier={tier} isActive={userProgress?.currentTier === tier.tier} />
              <View style={styles.tierInfo}>
                <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                <Text style={[styles.tierThreshold, { color: colors.textMuted }]}>
                  {tier.threshold.toLocaleString()} required
                </Text>
              </View>
              {userProgress && userProgress.currentValue >= tier.threshold && (
                <CheckCircle2 color={colors.statusUnlocked} size={20} />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Progress */}
      {userProgress && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily }]}>Your Progress</Text>
          {nextTier ? (
            <ProgressBar
              value={userProgress.currentValue}
              maxValue={nextTier.threshold}
              label={`Next: ${nextTier.label}`}
              color={nextTier.iconColor}
            />
          ) : (
            <View style={[styles.maxBadge, { backgroundColor: colors.statusUnlocked + '15', flexDirection: 'row', gap: Spacing.sm }]}>
              <Trophy size={16} color={colors.statusUnlocked} />
              <Text style={[{ color: colors.statusUnlocked, fontWeight: '600', fontSize: FontSizes.sm }]}>
                Maximum tier achieved!
              </Text>
            </View>
          )}
          {userProgress.isEstimated && (
            <View style={[styles.warningBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
              <AlertTriangle size={14} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                Estimated — may not be fully accurate
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      {achievement.notes && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily }]}>Notes</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{achievement.notes}</Text>
        </View>
      )}

      {/* Tracking Info */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily }]}>Tracking Info</Text>
        <InfoRow label="Category" value={achievement.category} colors={colors} />
        <InfoRow label="Earnable" value={achievement.isEarnable ? 'Yes' : 'No (Legacy)'} colors={colors} />
        <InfoRow label="Tracking" value={
          achievement.trackingAbility === 'auto' ? 'Automatic' :
          achievement.trackingAbility === 'partial' ? 'Partial' :
          achievement.trackingAbility === 'manual' ? 'Manual' : 'Legacy'
        } colors={colors} />
        <InfoRow label="Automatable" value={achievement.canAutoEarn ? 'Yes' : 'No'} colors={colors} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  errorText: { fontSize: FontSizes.lg, fontWeight: '600' },
  heroCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroImage: { width: 120, height: 120, marginBottom: Spacing.lg },
  name: { fontSize: FontSizes.xl, fontWeight: '700', marginBottom: Spacing.xs, textAlign: 'center' },
  description: { fontSize: FontSizes.sm, textAlign: 'center', marginBottom: Spacing.md },
  badges: { flexDirection: 'row', gap: Spacing.sm },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: Spacing.md },
  sectionText: { fontSize: FontSizes.sm, lineHeight: 22 },
  bigActionBtn: {
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  bigActionBtnText: { color: '#ffffff', fontSize: FontSizes.md, fontWeight: '600' },
  actionMsg: { fontSize: FontSizes.xs, marginTop: Spacing.sm, textAlign: 'center' },
  manualWarning: { fontSize: FontSizes.sm, textAlign: 'center', fontStyle: 'italic' },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  tierInfo: { flex: 1 },
  tierLabel: { fontSize: FontSizes.sm, fontWeight: '600' },
  tierThreshold: { fontSize: FontSizes.xs, marginTop: 2 },
  maxBadge: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  warningBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  warningText: { fontSize: FontSizes.xs },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLabel: { fontSize: FontSizes.sm },
  infoValue: { fontSize: FontSizes.sm, fontWeight: '600', textTransform: 'capitalize' },
});
