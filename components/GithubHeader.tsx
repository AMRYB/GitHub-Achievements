import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Image, Platform, ScrollView, TextInput, Linking } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useRouter, usePathname } from 'expo-router';
import { FontSizes, Spacing, BorderRadius, FontFamily } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  Menu, Search, Sun, Moon, LogOut, Settings, User, Code, CircleDot, GitPullRequest, Bot, PlayCircle, Columns, BookOpen, Shield, LineChart, Star, Globe, ArrowRightLeft
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GithubHeader() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { profile, logout } = useAuth();
  const { query, setQuery } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const username = profile?.username || 'guest';
  const avatarUrl = profile?.avatarUrl || 'https://github.com/identicons/newuser.png';
  const fullName = profile?.name || username;
  const statusEmoji = profile?.status?.emoji || '🕵️';
  const statusMessage = profile?.status?.message || 'Focusing';

  const repoTabs = [
    { label: 'Code', icon: Code, route: '/' },
    { label: 'Actions', icon: PlayCircle, route: '/actions' },
    { label: 'Insights', icon: LineChart, route: '/dashboard' },
  ];

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top, backgroundColor: '#010409' }]}>
      {/* 1. Global Black Nav Bar */}
      <View style={styles.topNav}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <FontAwesome5 name="github" size={32} color="#fff" style={{ marginRight: Spacing.md }} />
          </TouchableOpacity>
          <View style={styles.breadcrumb}>
            <Text style={[styles.breadcrumbText, { color: '#8b949e' }]}>{username}</Text>
            <Text style={[styles.slash, { color: '#8b949e' }]}> / </Text>
            <Text style={[styles.breadcrumbText, { color: '#fff', fontWeight: 'bold' }]}>GitHub-Achievements</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <Pressable style={({ hovered }: any) => [styles.searchBox, hovered && styles.actionBtnHovered]}>
            <Search size={16} color="#8b949e" style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1, minWidth: 90, justifyContent: 'center' }}>
              <TextInput
                style={[styles.searchText, { color: '#fff', flex: 1, outlineStyle: 'none', zIndex: 2 } as any]}
                placeholder=""
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  if (pathname !== '/') {
                    router.push('/');
                  }
                }}
              />
              {query === '' && (
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, {flexDirection: 'row', alignItems: 'center', zIndex: 1}]}>
                  <Text style={{color: '#8b949e', fontSize: FontSizes.sm, fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined}}>Type</Text>
                  <View style={[styles.searchKeyBox, { backgroundColor: 'transparent' }]}>
                    <Text style={styles.searchKey}>/</Text>
                  </View>
                  <Text style={{color: '#8b949e', fontSize: FontSizes.sm, fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined}}>to search</Text>
                </View>
              )}
            </View>
          </Pressable>

          <Pressable 
            onPress={() => Linking.openURL('https://github.com/AMRYB/GitHub-Achievements')}
            style={({ hovered }: any) => [styles.actionBtn, hovered && styles.actionBtnHovered]}
          >
            {({ hovered }: any) => (
              <>
                <Star size={16} color="#8b949e" />
                {Platform.OS === 'web' && hovered && (
                  <View style={styles.tooltip}>
                    <Text style={[styles.tooltipText, { whiteSpace: 'nowrap' } as any]}>Star the project</Text>
                  </View>
                )}
              </>
            )}
          </Pressable>

          {/* Vertical Separator */}
          <View style={styles.separator} />

          <Pressable style={({ hovered }: any) => [styles.actionBtn, hovered && styles.actionBtnHovered]}>
            {({ hovered }: any) => (
              <>
                <Globe size={16} color="#8b949e" />
                {Platform.OS === 'web' && hovered && (
                  <View style={[styles.tooltip, { width: 200, right: -40, left: 'auto', transform: [] }]}>
                    <Text style={[styles.tooltipText, { textAlign: 'center', lineHeight: 18 }]}>العربي، الانجليزي، الفرنساوي، الالماني، الروسي، الصيني</Text>
                  </View>
                )}
              </>
            )}
          </Pressable>
          
          <Pressable onPress={toggleTheme} style={({ hovered }: any) => [styles.actionBtn, hovered && styles.actionBtnHovered]}>
            {isDark ? <Sun size={16} color="#8b949e" /> : <Moon size={16} color="#8b949e" />}
          </Pressable>

          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={[styles.avatarBtn, { marginLeft: Spacing.xs }]} activeOpacity={0.8}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Repository Tabs Nav */}
      <View style={[styles.repoNav, { backgroundColor: '#010409', borderBottomColor: '#30363d' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {repoTabs.map((tab, idx) => {
            const isTabActive = pathname === tab.route;
            const tabColor = isTabActive ? '#c9d1d9' : '#8b949e';
            const borderBottomWidth = isTabActive ? 2 : 0;
            const borderBottomColor = isTabActive ? '#f78166' : 'transparent';
            const fontFamily = Platform.OS === 'web' ? FontFamily.sans : undefined;

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.tabItem, { borderBottomWidth, borderBottomColor }]}
                onPress={() => {
                  if (tab.route) {
                    router.push(tab.route as any);
                    setMenuOpen(false);
                  }
                }}
              >
                <tab.icon size={16} color={tabColor} style={{ marginRight: 8 }} />
                <Text style={[styles.tabText, { color: tabColor, fontWeight: isTabActive ? '600' : '400', fontFamily } as any]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Profile Dropdown Menu (Absolute positioned) */}
      {menuOpen && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.dropdownHeaderArea} onPress={() => { router.push('/settings'); setMenuOpen(false); }}>
            <Image source={{ uri: avatarUrl }} style={styles.dropdownAvatarLg} />
            <View style={styles.dropdownUserInfo}>
              <Text style={[styles.dropdownUsernameLg, { color: colors.text }]} numberOfLines={1}>{username}</Text>
              <Text style={[styles.dropdownFullName, { color: '#8b949e' }]} numberOfLines={1}>{fullName}</Text>
            </View>
            <ArrowRightLeft size={16} color="#8b949e" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dropdownStatusArea}>
            <Text style={{ fontSize: 16, marginRight: Spacing.sm }}>{statusEmoji}</Text>
            <Text style={[styles.dropdownStatusText, { color: colors.text }]} numberOfLines={1}>{statusMessage}</Text>
          </TouchableOpacity>

          <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/settings'); setMenuOpen(false); }}>
            <User size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/settings'); setMenuOpen(false); }}>
            <Settings size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => { logout(); setMenuOpen(false); }}>
            <LogOut size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100, // Make sure dropdown overlays content
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: '#010409',
    zIndex: 10,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: Spacing.lg,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.lg,
    display: Platform.OS === 'web' ? 'flex' : 'none', // hide breadcrumb on mobile natively due to space
  },
  breadcrumbText: {
    fontSize: FontSizes.md,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
  slash: {
    fontSize: FontSizes.lg,
    marginHorizontal: 4,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginRight: Spacing.lg,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  searchText: {
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
  searchKeyBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 0,
    marginHorizontal: 4,
    marginTop: 3,
  },
  searchKey: {
    color: '#8b949e',
    fontSize: 12,
    // Fix layout offset in center
    lineHeight: 14,
    textAlign: 'center',
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: '#30363d',
    marginHorizontal: Spacing.sm,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: BorderRadius.md,
    width: 30,
    height: 30,
    marginHorizontal: Spacing.xs,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  actionBtnHovered: {
    backgroundColor: 'rgba(177, 186, 196, 0.12)',
  },
  avatarBtn: {
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 100,
    overflow: 'hidden',
  },
  avatar: {
    width: 32,
    height: 32,
  },
  repoNav: {
    backgroundColor: '#010409',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.xl,
    zIndex: 1,
  },
  tabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    marginRight: Spacing.lg,
  },
  tabText: {
    fontSize: FontSizes.sm,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    width: 260,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 1000,
  },
  dropdownHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  dropdownAvatarLg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  dropdownUserInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  dropdownUsernameLg: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
  dropdownFullName: {
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
    marginTop: 2,
  },
  dropdownStatusArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  dropdownStatusText: {
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
  dropdownUsername: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
  dropdownDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuItemText: {
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
  tooltip: {
    position: 'absolute',
    top: 36,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    backgroundColor: '#30363d',
    borderColor: '#30363d',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? FontFamily.sans : undefined,
  },
});
