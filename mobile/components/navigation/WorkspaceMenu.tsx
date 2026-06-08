import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarCircle } from '@/components/design-system';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import {
  isNavItemActive,
  mainNavItems,
  studioNavItems,
  type WorkspaceMenuItem,
} from '@/lib/workspace-menu';
import { routes } from '@/lib/routes';

const LOGO = require('@/assets/brand/logo-transparent.png');
const DRAWER_WIDTH = 296;

function activeIconName(icon: keyof typeof Ionicons.glyphMap): keyof typeof Ionicons.glyphMap {
  if (!icon.endsWith('-outline')) return icon;
  const filled = icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap;
  return filled in Ionicons.glyphMap ? filled : icon;
}

function ProfileAvatar({ name, imageUrl, size = 40 }: { name: string; imageUrl?: string | null; size?: number }) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return <AvatarCircle name={name} size={size} />;
}

function NavRow({
  item,
  active,
  onPress,
}: {
  item: WorkspaceMenuItem;
  active: boolean;
  onPress: () => void;
}) {
  const iconName = active ? activeIconName(item.icon) : item.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
        active && styles.navRowActive,
        pressed && !active && styles.navRowPressed,
      ]}
    >
      <View style={styles.navIconSlot}>
        <Ionicons name={iconName} size={18} color={active ? colors.text : colors.textMuted} />
      </View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export function WorkspaceMenuTrigger() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();
  const { planName } = useSubscriptionPlan();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, DRAWER_WIDTH);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const displayName = user?.name ?? user?.first_name ?? user?.email ?? 'User';
  const studioName = user?.studio?.name;
  const avatarUrl = user?.profile_picture ?? user?.photoURL ?? null;

  const navigate = (href: WorkspaceMenuItem['href']) => {
    closeDrawer(() => router.push(href));
  };

  const openDrawer = () => {
    slideAnim.setValue(-drawerWidth);
    fadeAnim.setValue(0);
    setVisible(true);
    setOpen(true);
  };

  const closeDrawer = (onClosed?: () => void) => {
    setOpen(false);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onClosed?.();
    });
  };

  useEffect(() => {
    if (!open) return;
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
        mass: 0.9,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, slideAnim, fadeAnim]);

  return (
    <>
      <Pressable
        onPress={openDrawer}
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
        hitSlop={6}
      >
        <Ionicons name="menu-outline" size={22} color={colors.text} />
      </Pressable>

      <Modal visible={visible} transparent animationType="none" onRequestClose={() => closeDrawer()}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDrawer()} accessibilityLabel="Close menu" />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                paddingTop: insets.top + spacing.sm,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="Focuspilot" />
                <Text style={styles.brandText}>
                  Focus<Text style={styles.brandTextMuted}>pilot</Text>
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.navScroll}
              contentContainerStyle={styles.navScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.navGroup}>
                {mainNavItems.map(item => (
                  <NavRow
                    key={item.key}
                    item={item}
                    active={isNavItemActive(pathname, item)}
                    onPress={() => navigate(item.href)}
                  />
                ))}
              </View>

              <View style={styles.sectionDivider}>
                <Text style={styles.sectionLabel}>Studio</Text>
              </View>

              <View style={styles.navGroup}>
                {studioNavItems.map(item => (
                  <NavRow
                    key={item.key}
                    item={item}
                    active={isNavItemActive(pathname, item)}
                    onPress={() => navigate(item.href)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={[styles.profileFooterWrap, { paddingBottom: insets.bottom + spacing.sm }]}>
              <Pressable
                style={({ pressed }) => [styles.profileFooter, pressed && styles.profileFooterPressed]}
                onPress={() => navigate(routes.settingsProfile)}
              >
                <ProfileAvatar name={displayName} imageUrl={avatarUrl} size={40} />
                <View style={styles.profileFooterText}>
                  <Text style={styles.profileFooterName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.profileFooterPlan} numberOfLines={1}>
                    {planName}
                  </Text>
                  {studioName ? (
                    <Text style={styles.profileFooterStudio} numberOfLines={1}>
                      {studioName}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.sidebarMuted} />
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  togglePressed: {
    backgroundColor: colors.sidebarAccent,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.sidebar,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.sidebarBorder,
    ...shadows.md,
  },
  drawerHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.sidebarBorder,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 36,
  },
  brandLogo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  brandTextMuted: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  navScroll: {
    flex: 1,
  },
  navScrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  navGroup: {
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingRight: spacing.sm,
    paddingLeft: 6,
    borderRadius: radius.md,
  },
  navRowActive: {
    backgroundColor: colors.sidebarAccent,
  },
  navRowPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  navIconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: -0.1,
  },
  navLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.sidebarMuted,
    letterSpacing: 1.2,
  },
  profileFooterWrap: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.sidebarBorder,
    backgroundColor: colors.sidebar,
  },
  profileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.sidebarBorder,
  },
  profileFooterPressed: {
    backgroundColor: colors.sidebarAccent,
  },
  profileFooterText: {
    flex: 1,
    minWidth: 0,
  },
  profileFooterName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  profileFooterPlan: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.clay,
    marginTop: 2,
  },
  profileFooterStudio: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatarImage: {
    backgroundColor: colors.sidebarAccent,
  },
});
