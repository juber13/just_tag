import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { MENU_PAGE_CONTENT } from '../../data/menuContent';
import { MenuStackParamList } from '../../navigation/types';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MenuStackParamList, 'MenuDetail'>;

export function MenuDetailScreen({ navigation, route }: Props) {
  const content = MENU_PAGE_CONTENT[route.params.page];

  const onCta = () => {
    if (route.params.page === 'helpSupport') {
      Alert.alert('Contact support', 'Email us at support@justagg.com');
      return;
    }
    Alert.alert(content.ctaLabel ?? 'Coming soon', 'This feature will be available in a future update.');
  };

  return (
    <ScreenContainer scroll edges={['top']} style={styles.root}>
      <ScreenHeader title={content.title} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={content.icon as keyof typeof Ionicons.glyphMap}
              size={32}
              color={colors.black}
            />
          </View>
          <Text style={styles.intro}>{content.intro}</Text>
        </View>

        {content.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body ? (
              <Text style={styles.sectionBody}>{section.body}</Text>
            ) : null}
            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        {content.ctaLabel ? (
          <PrimaryButton
            title={content.ctaLabel}
            variant="blue"
            style={styles.cta}
            onPress={onCta}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.inputBg,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
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
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.black,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cta: {
    marginTop: spacing.lg,
  },
});
