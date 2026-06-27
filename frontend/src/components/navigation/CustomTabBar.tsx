import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductAccess } from '../../context/useProductAccess';
import { colors, spacing, typography } from '../../theme';

const TAB_CONFIG: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'ProfileTab', label: 'Profile', icon: 'person-outline', iconFocused: 'person' },
  { name: 'ContactsTab', label: 'Contacts', icon: 'people-outline', iconFocused: 'people' },
  { name: 'ShareTab', label: '', icon: 'qr-code', iconFocused: 'qr-code' },
  { name: 'AnalyticsTab', label: 'Analytics', icon: 'bar-chart-outline', iconFocused: 'bar-chart' },
  { name: 'MenuTab', label: 'Menu', icon: 'grid-outline', iconFocused: 'grid' },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isProductActive } = useProductAccess();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TAB_CONFIG.map((tab, index) => {
        const route = state.routes[index];
        const isFocused = state.index === index;
        const isCenter = tab.name === 'ShareTab';
        const isLocked =
          !isProductActive && (tab.name === 'ShareTab' || tab.name === 'AnalyticsTab' || tab.name === 'ContactsTab');

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <View key={tab.name} style={styles.centerWrap}>
              <Pressable style={styles.centerButton} onPress={onPress}>
                <Ionicons name="qr-code" size={28} color={colors.white} />
                {isLocked ? (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={10} color={colors.white} />
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        }

        return (
          <Pressable key={tab.name} style={styles.tab} onPress={onPress}>
            <View style={styles.tabIconWrap}>
              <Ionicons
                name={isFocused ? tab.iconFocused : tab.icon}
                size={24}
                color={isFocused ? colors.black : colors.textSecondary}
              />
              {isLocked ? (
                <View style={styles.tabLockBadge}>
                  <Ionicons name="lock-closed" size={8} color={colors.white} />
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.tabBarBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    minHeight: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  labelActive: {
    color: colors.black,
    fontWeight: '600',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lockBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  tabIconWrap: {
    position: 'relative',
  },
  tabLockBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
