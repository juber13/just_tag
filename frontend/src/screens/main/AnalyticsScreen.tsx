import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProductAccess } from '../../context/useProductAccess';
import { ProductLockedView } from '../../components/subscription/ProductLockedView';
import { getCachedContacts } from '../../services/contactsStorage';
import { fetchProfileAnalytics, resolveProfileApiContext } from '../../services/profileApi';
import { Contact } from '../../types/contact';
import {
  ANALYTICS_RANGE_OPTIONS,
  AnalyticsRange,
  ProfileAnalytics,
} from '../../types/analytics';
import { colors, layout, spacing, typography } from '../../theme';

function formatCount(value: number): string {
  return value.toLocaleString();
}

function formatRate(value: number): string {
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}%`;
}

function rangeStartMs(range: AnalyticsRange): number | null {
  switch (range) {
    case '24h':
      return Date.now() - 24 * 60 * 60 * 1000;
    case 'week':
      return Date.now() - 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return Date.now() - 30 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function contactCountInRange(contacts: Contact[], range: AnalyticsRange): number {
  const sinceMs = rangeStartMs(range);
  if (sinceMs === null) return contacts.length;
  return contacts.filter((contact) => new Date(contact.createdAt).getTime() >= sinceMs).length;
}

export function AnalyticsScreen() {
  const { user } = useAuth();
  const { isProductActive } = useProductAccess();
  const [range, setRange] = useState<AnalyticsRange>('all');
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(
    async (options?: { showSpinner?: boolean }) => {
      if (options?.showSpinner) setRefreshing(true);
      try {
        const context = await resolveProfileApiContext(user);
        if (!context) {
          setAnalytics(null);
          return;
        }
        const data = await fetchProfileAnalytics(context.slug, context.ownerEmail, range);
        const cachedContacts = await getCachedContacts();
        const cachedContactCount = contactCountInRange(cachedContacts, range);

        if (data) {
          setAnalytics({
            ...data,
            contacts: Math.max(data.contacts, cachedContactCount),
          });
        } else if (cachedContactCount > 0) {
          setAnalytics({
            range,
            rangeLabel:
              ANALYTICS_RANGE_OPTIONS.find((option) => option.value === range)?.label ??
              'All Time',
            views: 0,
            clicks: 0,
            contacts: cachedContactCount,
            contactModals: 0,
            clickRate: 0,
            links: [],
            daily: [],
          });
        } else {
          setAnalytics(null);
        }
      } finally {
        setLoading(false);
        if (options?.showSpinner) setRefreshing(false);
      }
    },
    [range, user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadAnalytics();
    }, [loadAnalytics]),
  );

  useEffect(() => {
    if (loading) return;
    void loadAnalytics({ showSpinner: true });
  }, [range]);

  const openRangePicker = () => {
    Alert.alert(
      'Time range',
      'Choose a reporting period',
      ANALYTICS_RANGE_OPTIONS.map((option) => ({
        text: option.label,
        onPress: () => setRange(option.value),
      })),
      { cancelable: true },
    );
  };

  const rangeLabel =
    ANALYTICS_RANGE_OPTIONS.find((option) => option.value === range)?.label ??
    analytics?.rangeLabel ??
    'All Time';

  const views = analytics?.views ?? 0;
  const clicks = analytics?.clicks ?? 0;
  const contacts = analytics?.contacts ?? 0;
  const clickRate = analytics?.clickRate ?? 0;
  const links = analytics?.links ?? [];

  const statRows = [
    { icon: 'eye-outline' as const, label: `${formatCount(views)} Views` },
    { icon: 'hand-left-outline' as const, label: `${formatCount(clicks)} Clicks` },
    { icon: 'people-outline' as const, label: `${formatCount(contacts)} Contacts` },
    { icon: 'stats-chart-outline' as const, label: `${formatRate(clickRate)} Click Rate` },
  ];

  if (!isProductActive) {
    return (
      <ProductLockedView
        title="Profile analytics"
        message="Activate your product to see profile views, link clicks, and contact stats."
        benefits={[
          'Profile views over time',
          'Link click tracking',
          'Contact and conversion stats',
        ]}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{rangeLabel}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCount(views)}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCount(clicks)}</Text>
            <Text style={styles.statLabel}>Clicks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatRate(clickRate)}</Text>
            <Text style={styles.statLabel}>Click Rate</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.dropdown} onPress={openRangePicker}>
        <Text style={styles.dropdownText}>{rangeLabel}</Text>
        {refreshing ? (
          <ActivityIndicator size="small" color={colors.black} />
        ) : (
          <Ionicons name="chevron-down" size={18} color={colors.black} />
        )}
      </Pressable>

      {statRows.map((row) => (
        <View key={row.label} style={styles.card}>
          <Ionicons name={row.icon} size={28} color={colors.black} />
          <Text style={styles.cardLabel}>{row.label}</Text>
          <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Links</Text>
      {links.length === 0 ? (
        <Text style={styles.emptyText}>No links on your profile yet.</Text>
      ) : (
        links.map((link) => (
          <View key={link.linkId} style={styles.linkRow}>
            <Text style={styles.linkLabel} numberOfLines={1}>
              {link.label}
            </Text>
            <Text style={styles.linkCount}>{formatCount(link.clicks)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  content: {
    paddingTop: spacing.xl + 20,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  title: {
    ...typography.screenTitle,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.summaryCardBg,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    ...typography.bodyBold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dropdownText: {
    ...typography.bodyBold,
    color: colors.black,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardLabel: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.black,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.black,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  linkLabel: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.black,
  },
  linkCount: {
    ...typography.bodyBold,
    color: colors.black,
    marginLeft: spacing.md,
  },
});
