import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ActionButton } from '@/components/ActionButton';
import { FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { 
  Zap, RefreshCw, GitPullRequest, Search, MessageCircle, 
  BarChart2, Star, Folder, ExternalLink, TrendingUp, Heart, User, Info 
} from 'lucide-react-native';

function ActionSection({
  title,
  description,
  children,
  colors,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>{description}</Text>
      <View style={styles.buttonGroup}>{children}</View>
    </View>
  );
}

export default function ActionsScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, profile, isSyncing, sync } = useAuth();

  const githubUsername = profile?.username || '';

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Sync Section */}
      {isAuthenticated && (
        <ActionSection title="Sync" description="Re-fetch your GitHub data to update progress." colors={colors}>
          <ActionButton
            title={isSyncing ? 'Syncing...' : 'Re-sync GitHub Data'}
            Icon={RefreshCw}
            onPress={sync}
            isLoading={isSyncing}
          />
        </ActionSection>
      )}

      {/* Pull Requests */}
      <ActionSection
        title="Pull Requests"
        description="Merge PRs to earn Pull Shark. Open PRs to collaboration repos."
        colors={colors}
      >
        {githubUsername ? (
          <>
            <ActionButton
              title="View Your Pull Requests"
              Icon={GitPullRequest}
              variant="secondary"
              onPress={() => openURL(`https://github.com/pulls?q=is:pr+author:${githubUsername}+is:merged`)}
            />
            <ActionButton
              title="Explore Repos to Contribute"
              Icon={Search}
              variant="secondary"
              onPress={() => openURL('https://github.com/explore')}
            />
          </>
        ) : (
          <ActionButton
            title="Search Pull Requests"
            Icon={GitPullRequest}
            variant="secondary"
            onPress={() => openURL('https://github.com/pulls')}
          />
        )}
      </ActionSection>

      {/* Discussions */}
      <ActionSection
        title="Discussions"
        description="Answer questions to earn Galaxy Brain."
        colors={colors}
      >
        <ActionButton
          title="Browse GitHub Discussions"
          Icon={MessageCircle}
          variant="secondary"
          onPress={() => openURL('https://github.com/discussions')}
        />
        {githubUsername && (
          <ActionButton
            title="Your Discussion Activity"
            Icon={BarChart2}
            variant="secondary"
            onPress={() => openURL(`https://github.com/${githubUsername}?tab=discussions`)}
          />
        )}
      </ActionSection>

      {/* Stars */}
      <ActionSection
        title="Stars & Repos"
        description="Get stars on your repos to earn Starstruck."
        colors={colors}
      >
        {githubUsername ? (
          <ActionButton
            title="View Your Repositories"
            Icon={Folder}
            variant="secondary"
            onPress={() => openURL(`https://github.com/${githubUsername}?tab=repositories`)}
          />
        ) : (
          <ActionButton
            title="Go to GitHub"
            Icon={ExternalLink}
            variant="secondary"
            onPress={() => openURL('https://github.com')}
          />
        )}
        <ActionButton
          title="GitHub Trending"
          Icon={TrendingUp}
          variant="secondary"
          onPress={() => openURL('https://github.com/trending')}
        />
      </ActionSection>

      {/* Sponsoring */}
      <ActionSection
        title="Sponsors"
        description="Sponsor an open-source developer to earn Public Sponsor."
        colors={colors}
      >
        <ActionButton
          title="Explore GitHub Sponsors"
          Icon={Heart}
          variant="secondary"
          onPress={() => openURL('https://github.com/sponsors/explore')}
        />
      </ActionSection>

      {/* Profile */}
      <ActionSection
        title="Your Profile"
        description="View your GitHub profile and achievements."
        colors={colors}
      >
        {githubUsername ? (
          <ActionButton
            title={`View @${githubUsername}`}
            Icon={ExternalLink}
            variant="secondary"
            onPress={() => openURL(`https://github.com/${githubUsername}`)}
          />
        ) : (
          <ActionButton
            title="Go to GitHub"
            Icon={ExternalLink}
            variant="secondary"
            onPress={() => openURL('https://github.com')}
          />
        )}
      </ActionSection>

      <View style={[styles.disclaimer, { borderColor: colors.border, flexDirection: 'row', gap: Spacing.sm }]}>
        <Info size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
        <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
          All actions open legitimate GitHub pages. This app does NOT automate, fake, or farm any achievements.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
    marginTop: Spacing.lg,
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
  },
  buttonGroup: {
    gap: Spacing.sm,
  },
  disclaimer: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    marginTop: Spacing.md,
  },
  disclaimerText: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
    flex: 1,
  },
});
