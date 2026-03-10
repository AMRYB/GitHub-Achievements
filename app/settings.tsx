import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { validateToken } from '@/services/github';
import { ActionButton } from '@/components/ActionButton';
import { FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { Settings, Palette, Sun, Moon, Key, CheckCircle2, Trash2, Link as LinkIcon, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, setThemePreference } = useTheme();
  const { token, isAuthenticated, profile, setToken, logout, sync } = useAuth();
  const router = useRouter();

  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSaveToken = async () => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setError('Please enter a token');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const valid = await validateToken(trimmed);
      if (valid) {
        await setToken(trimmed);
        setTokenInput('');
        // Auto-sync on first connect
        try {
          await sync();
        } catch {
          // Sync error handled by context
        }
        if (Platform.OS !== 'web') {
          Alert.alert('Success', 'GitHub token saved and data synced!');
        }
      } else {
        setError('Invalid token. Please check and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate token');
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Clear Data', 'This will remove your token and all local data. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: logout },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl }}>
        <Settings size={28} color={colors.text} />
        <Text style={[styles.pageTitle, { color: colors.text, marginBottom: 0 }]}>Settings</Text>
      </View>

      {/* Theme */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
          <Palette size={20} color={colors.text} />
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Theme</Text>
        </View>
        <View style={styles.themeButtons}>
          <ActionButton title="Light" Icon={Sun} variant={!isDark ? 'primary' : 'outline'} onPress={() => setThemePreference('light')} style={styles.themeBtn} />
          <ActionButton title="Dark" Icon={Moon} variant={isDark ? 'primary' : 'outline'} onPress={() => setThemePreference('dark')} style={styles.themeBtn} />
        </View>
      </View>

      {/* GitHub Token */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
          <Key size={20} color={colors.text} />
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>GitHub Token</Text>
        </View>

        {isAuthenticated ? (
          <>
            <View style={[styles.connectedBox, { backgroundColor: colors.statusUnlocked + '10', borderColor: colors.statusUnlocked + '30', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }]}>
              <CheckCircle2 color={colors.statusUnlocked} size={18} />
              <Text style={[styles.connectedText, { color: colors.statusUnlocked }]}>
                Connected as @{profile?.username || 'unknown'}
              </Text>
            </View>
            <Text style={[styles.tokenPreview, { color: colors.textMuted }]}>
              Token: {token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '***'}
            </Text>
            <ActionButton
              title="Disconnect & Clear Data"
              Icon={Trash2}
              variant="danger"
              onPress={handleLogout}
              style={{ marginTop: Spacing.md }}
            />
          </>
        ) : (
          <>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Enter your GitHub Personal Access Token to track achievement progress.{'\n\n'}
              How to create one:{'\n'}
              1. Go to github.com → Settings → Developer Settings{'\n'}
              2. Personal Access Tokens → Tokens (classic){'\n'}
              3. Generate new token{'\n'}
              4. Select scopes: repo, read:user{'\n'}
              5. Copy and paste the token below
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.text,
                  borderColor: error ? colors.error : colors.border,
                },
              ]}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor={colors.textMuted}
              value={tokenInput}
              onChangeText={(text) => {
                setTokenInput(text);
                setError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}
            <ActionButton
              title={isValidating ? 'Validating...' : 'Connect GitHub'}
              Icon={LinkIcon}
              onPress={handleSaveToken}
              isLoading={isValidating}
              style={{ marginTop: Spacing.md }}
            />
          </>
        )}
      </View>

      {/* Info */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
          <Info size={20} color={colors.text} />
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>About</Text>
        </View>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          GitHub Achievements Guide & Tracker helps you understand and track your GitHub achievements.{'\n\n'}
          • All data stays on your device{'\n'}
          • Your token is never sent to any third-party server{'\n'}
          • GitHub API calls are made directly from your device{'\n'}
          • No automation, farming, or fake activity
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
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    marginBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeBtn: {
    flex: 1,
  },
  connectedBox: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  connectedText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  tokenPreview: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  helpText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.md,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  errorText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
  },
});
