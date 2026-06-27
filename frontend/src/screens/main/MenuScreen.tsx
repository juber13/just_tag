import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { AUTH_ENABLED } from '../../config/appConfig';
import { useAuth } from '../../context/AuthContext';
import { useProductAccess } from '../../context/useProductAccess';
import { MENU_ITEM_ROUTES } from '../../data/menuContent';
import { MenuStackParamList } from '../../navigation/types';
import { colors, layout, spacing, typography } from '../../theme';

const MENU_ITEMS = Object.keys(MENU_ITEM_ROUTES);

type Props = NativeStackScreenProps<MenuStackParamList, 'MenuMain'>;

export function MenuScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { isProductActive } = useProductAccess();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable>
          <Ionicons name="person-add-outline" size={26} color={colors.black} />
        </Pressable>
        <Text style={styles.title}>Menu</Text>
        <Pressable>
          <Ionicons name="notifications-outline" size={26} color={colors.black} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.textSecondary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.fullName ?? ''}</Text>
          <Text style={styles.phone}>{user?.mobile || user?.email || ''}</Text>
        </View>
        <Pressable style={styles.manageBtn}>
          <Text style={styles.manageText}>Manage</Text>
          <Ionicons name="create-outline" size={14} color={colors.white} />
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Complete Your Profile</Text>
      <View style={styles.progressRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.progressSegment} />
        ))}
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressText}>0% Completed</Text>
        <Text style={styles.progressText}>0/5 Completed</Text>
      </View>

      {isProductActive ? (
        <Pressable
          style={styles.activeCard}
          onPress={() => navigation.navigate('ActivateProduct')}
        >
          <Ionicons name="checkmark-circle" size={22} color={colors.toggleGreen} />
          <View style={styles.activeCardText}>
            <Text style={styles.activeCardTitle}>Product Active</Text>
            <Text style={styles.activeCardSubtitle}>Your profile is live</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : (
        <PrimaryButton
          title="Activate Product"
          variant="blue"
          style={styles.blueBtn}
          onPress={() => navigation.navigate('ActivateProduct')}
        />
      )}

      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item}
          style={styles.menuRow}
          onPress={() =>
            navigation.navigate('MenuDetail', { page: MENU_ITEM_ROUTES[item] })
          }
        >
          <Text style={styles.menuText}>{item}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      ))}

      <PrimaryButton
        title="Share Feedback"
        variant="blue"
        style={styles.feedbackBtn}
        onPress={() => navigation.navigate('ShareFeedback')}
      />

      {AUTH_ENABLED ? (
        <OutlineButton title="Sign Out" onPress={signOut} style={styles.signOutBtn} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.inputBg,
  },
  content: {
    paddingTop: spacing.xl + 20,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.black,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
    color: colors.black,
  },
  phone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.pillRadius,
  },
  manageText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  blueBtn: {
    marginBottom: spacing.lg,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.toggleGreen,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  activeCardText: {
    flex: 1,
  },
  activeCardTitle: {
    ...typography.bodyBold,
    color: colors.black,
  },
  activeCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  menuText: {
    ...typography.body,
    color: colors.black,
  },
  feedbackBtn: {
    marginTop: spacing.lg,
  },
  signOutBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
