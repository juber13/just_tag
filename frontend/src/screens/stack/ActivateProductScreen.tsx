import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useProductAccess } from '../../context/useProductAccess';
import { MenuStackParamList } from '../../navigation/types';
import { profilePublicUrl } from '../../config/profileServer';
import { useAuth } from '../../context/AuthContext';
import {
  applySubscriptionFromServer,
  createRazorpayOrder,
  fetchPlans,
  PaymentPlan,
  razorpayCheckoutUrl,
} from '../../services/paymentApi';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MenuStackParamList, 'ActivateProduct'>;

const PLAN_BENEFITS = [
  'Public profile link you can share anywhere',
  'Scannable QR code for in-person networking',
  'Lead capture form on your profile page',
  'Contacts synced to the app',
  'Views, clicks, and link analytics',
];

const FALLBACK_PLAN: PaymentPlan = {
  id: 'annual',
  name: 'Justagg Annual',
  amountPaise: 100,
  currency: 'INR',
  priceLabel: '₹1 / year',
};

export function ActivateProductScreen({ navigation }: Props) {
  const { user, patchUserLocal } = useAuth();
  const { isProductActive } = useProductAccess();
  const [plan, setPlan] = useState<PaymentPlan>(FALLBACK_PLAN);
  const [paying, setPaying] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const profileLink =
    user?.profileUrl?.trim() ||
    (user?.profileSlug ? profilePublicUrl(user.profileSlug) : '');

  useEffect(() => {
    void fetchPlans().then((plans) => {
      if (plans.length > 0) setPlan(plans[0]);
    });
  }, []);

  const refreshActivation = useCallback(async () => {
    if (!user?.email) return false;
    const next = await applySubscriptionFromServer(user);
    await patchUserLocal(next);
    return next.subscriptionStatus === 'active';
  }, [patchUserLocal, user]);

  const handleCheckoutSuccess = useCallback(async () => {
    setCheckoutVisible(false);
    setCheckoutUrl('');
    setPaying(true);
    try {
      const active = await refreshActivation();
      if (active) {
        Alert.alert('Payment successful', 'Your Justagg product is now active.');
        return;
      }
      Alert.alert(
        'Payment received',
        'We are activating your account. Please check back in a moment.',
      );
    } finally {
      setPaying(false);
    }
  }, [refreshActivation]);

  const handlePay = async () => {
    if (!user?.email?.trim()) {
      Alert.alert('Sign in required', 'Please sign in before activating your product.');
      return;
    }

    setPaying(true);
    try {
      const order = await createRazorpayOrder(user.email, plan.id);
      setCheckoutUrl(razorpayCheckoutUrl(order.orderId, user.email));
      setCheckoutVisible(true);
    } catch (error) {
      Alert.alert(
        'Payment unavailable',
        error instanceof Error ? error.message : 'Could not start checkout.',
      );
    } finally {
      setPaying(false);
    }
  };

  if (isProductActive) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Product Active" onBack={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.activeContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.activeIconWrap}>
            <Ionicons name="checkmark-circle" size={56} color={colors.toggleGreen} />
          </View>
          <Text style={styles.activeTitle}>You&apos;re all set</Text>
          <Text style={styles.activeMessage}>
            Your Justagg product is active. Share your profile link and start collecting leads.
          </Text>
          {profileLink ? (
            <View style={styles.linkCard}>
              <Text style={styles.linkLabel}>Your profile link</Text>
              <Text style={styles.linkValue} selectable>
                {profileLink}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Activate Product" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Ionicons name="card-outline" size={40} color={colors.primaryBlue} />
        </View>
        <Text style={styles.title}>Go live with Justagg</Text>
        <Text style={styles.subtitle}>
          Activate your product to publish your profile, share your link, and track engagement.
        </Text>

        <View style={styles.planCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{plan.priceLabel}</Text>
          <Text style={styles.planNote}>Secure payment via Razorpay</Text>
        </View>

        <Text style={styles.sectionTitle}>What you unlock</Text>
        {PLAN_BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.toggleGreen} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}

        <PrimaryButton
          title={paying ? 'Starting checkout…' : 'Pay & Activate'}
          variant="blue"
          style={styles.payBtn}
          onPress={paying || checkoutVisible ? undefined : () => void handlePay()}
        />
        {paying && !checkoutVisible ? (
          <ActivityIndicator style={styles.spinner} color={colors.primaryBlue} />
        ) : null}
        <Text style={styles.footerNote}>
          You can still edit your profile before activating. Your public page goes live after payment.
        </Text>
      </ScrollView>

      <RazorpayCheckoutModal
        visible={checkoutVisible}
        checkoutUrl={checkoutUrl}
        onSuccess={() => void handleCheckoutSuccess()}
        onCancel={() => {
          setCheckoutVisible(false);
          setCheckoutUrl('');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  activeContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: 100,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.summaryCardBg,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  planName: {
    ...typography.bodyBold,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  planNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.black,
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  benefitText: {
    flex: 1,
    ...typography.body,
    color: colors.black,
    lineHeight: 22,
  },
  payBtn: {
    marginTop: spacing.lg,
  },
  spinner: {
    marginTop: spacing.md,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  activeIconWrap: {
    marginBottom: spacing.lg,
  },
  activeTitle: {
    ...typography.screenTitle,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  activeMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  linkCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.inputBg,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
  },
  linkLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  linkValue: {
    ...typography.bodyBold,
    color: colors.black,
  },
});
