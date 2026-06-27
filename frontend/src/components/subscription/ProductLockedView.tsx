import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { navigateToActivateProduct } from '../../navigation/activateNavigation';
import { PrimaryButton } from '../ui/PrimaryButton';
import { colors, layout, spacing, typography } from '../../theme';

const DEFAULT_BENEFITS = [
  'Your public profile link & QR code',
  'Share your card anywhere',
  'Lead capture & contacts',
  'Profile analytics',
];

type Props = {
  title?: string;
  message?: string;
  benefits?: string[];
};

export function ProductLockedView({
  title = 'Activate to unlock',
  message = 'Purchase and activate your Justagg product to access this feature.',
  benefits = DEFAULT_BENEFITS,
}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={32} color={colors.primaryBlue} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.benefitsCard}>
        {benefits.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.toggleGreen} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton
        title="Activate Product"
        variant="blue"
        style={styles.cta}
        onPress={() =>
          navigateToActivateProduct(navigation as NavigationProp<ParamListBase>)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
    backgroundColor: colors.white,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  benefitsCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.inputBg,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
    ...typography.body,
    color: colors.black,
  },
  cta: {
    alignSelf: 'stretch',
  },
});
