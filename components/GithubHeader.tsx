import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import { FontSizes, Spacing, BorderRadius, FontFamily } from '@/constants/theme';
import { 
  Menu, Search, Sun, Moon, LogOut, Settings, User, Code, CircleDot, GitPullRequest, Bot, PlayCircle, Columns, BookOpen, Shield, LineChart
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GithubHeader() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const username = profile?.username || 'guest';
  const avatarUrl = profile?.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';

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
            <Image source={{ uri: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }} style={{ width: 32, height: 32, tintColor: '#fff', marginRight: Spacing.md }} />
          </TouchableOpacity>
          <View style={styles.breadcrumb}>
            <Text style={[styles.breadcrumbText, { color: '#8b949e' }]}>{username}</Text>
            <Text style={[styles.slash, { color: '#8b949e' }]}> / </Text>
            <Text style={[styles.breadcrumbText, { color: '#fff', fontWeight: 'bold' }]}>GitHub-Achievements</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <View style={styles.searchBox}>
            <Search size={16} color="#8b949e" style={{ marginRight: Spacing.sm }} />
            <Text style={[styles.searchText, { color: '#8b949e' }]}>Type </Text>
            <View style={styles.searchKeyBox}><Text style={styles.searchKey}>/</Text></View>
            <Text style={[styles.searchText, { color: '#8b949e' }]}> to search</Text>
          </View>
          
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            {isDark ? <Sun size={20} color="#fff" /> : <Moon size={20} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.avatarBtn} activeOpacity={0.8}>
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
          <Text style={[styles.dropdownUsername, { color: colors.text }]}>{username}</Text>
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
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 4,
    paddingHorizontal: 4,
    marginHorizontal: 4,
  },
  searchKey: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconBtn: {
    marginRight: Spacing.lg,
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
    width: 200,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
});
