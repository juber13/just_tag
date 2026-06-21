import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

const STAT_ROWS = [
  { icon: 'eye-outline' as const, label: '0 Views' },
  { icon: 'hand-left-outline' as const, label: '0 Clicks' },
  { icon: 'people-outline' as const, label: '0 Contacts' },
  { icon: 'stats-chart-outline' as const, label: '0% Clicks Rates' },
];

export function AnalyticsScreen() {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Analytics</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Past 24 Hours</Text>
        <View style={styles.summaryRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Clicks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Click Rate</Text>
          </View>
        </View>
      </View>
      <View style={styles.dropdown}>
        <Text style={styles.dropdownText}>Week</Text>
        <Ionicons name="chevron-down" size={18} color={colors.black} />
      </View>
      {STAT_ROWS.map((row) => (
        <View key={row.label} style={styles.card}>
          <Ionicons name={row.icon} size={28} color={colors.black} />
          <Text style={styles.cardLabel}>{row.label}</Text>
          <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
        </View>
      ))}
      <Text style={styles.sectionTitle}>Links</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  },
});
