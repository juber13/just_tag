import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { AuthStackParamList } from '../../navigation/types';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer contentStyle={styles.content}>
      <Text style={styles.brand}>JUSTAGG</Text>
      <View style={styles.hero}>
        <View style={styles.cardBehind} />
        <View style={styles.phone}>
          <View style={styles.phoneScreen}>
            <View style={styles.miniAvatar} />
            <Text style={styles.miniName}>Shivansh Soni</Text>
            <Text style={styles.miniTitle}>Entrepreneur</Text>
            <View style={styles.miniBtn} />
            <View style={styles.iconRow}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.miniIcon} />
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          title="Create an Account"
          onPress={() => navigation.navigate('CreateAccount')}
        />
        <OutlineButton
          title="Sign In"
          style={styles.signIn}
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  brand: {
    ...typography.brand,
    color: colors.black,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBehind: {
    position: 'absolute',
    width: 200,
    height: 120,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    transform: [{ rotate: '-8deg' }, { translateX: 40 }],
  },
  phone: {
    width: 160,
    height: 280,
    backgroundColor: colors.black,
    borderRadius: 24,
    padding: 8,
    transform: [{ rotate: '-5deg' }],
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.sm,
    alignItems: 'center',
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    marginTop: spacing.sm,
  },
  miniName: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  miniTitle: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  miniBtn: {
    width: 60,
    height: 16,
    backgroundColor: colors.black,
    borderRadius: 8,
    marginTop: 6,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
    justifyContent: 'center',
  },
  miniIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.inputBg,
  },
  actions: {
    gap: spacing.md,
  },
  signIn: {
    marginTop: spacing.sm,
  },
});
