import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { MainStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useProductAccess } from '../../context/useProductAccess';
import { ProductLockedView } from '../../components/subscription/ProductLockedView';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'SignaturePreview'>;

export function SignaturePreviewScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { isProductActive } = useProductAccess();
  const [includeQr, setIncludeQr] = useState(true);

  if (!isProductActive) {
    return (
      <View style={styles.lockedRoot}>
        <ScreenHeader title="Signature Preview" onBack={() => navigation.goBack()} />
        <ProductLockedView
          title="Email signature"
          message="Activate your product to create an email signature with your profile QR code."
          benefits={['Branded email signature', 'Embedded profile QR code', 'Download ready to use']}
        />
      </View>
    );
  }

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Signature Preview"
        onBack={() => navigation.goBack()}
      />
      <Pressable style={styles.checkRow} onPress={() => setIncludeQr((v) => !v)}>
        <View style={[styles.checkbox, includeQr && styles.checkboxOn]}>
          {includeQr ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
        </View>
        <Text style={styles.checkLabel}>Include QR Code</Text>
      </Pressable>
      <View style={styles.previewCard}>
        <View style={styles.previewLeft}>
          <View style={styles.previewAvatar}>
            <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.previewName}>{user?.fullName ?? ''}</Text>
        </View>
        <View style={styles.divider} />
        {includeQr ? (
          <View style={styles.previewRight}>
            <View style={styles.miniQr}>
              {Array.from({ length: 25 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.miniCell, i % 2 === 0 && styles.miniCellFilled]}
                />
              ))}
            </View>
            <Text style={styles.connectText}>Connect with me</Text>
          </View>
        ) : null}
      </View>
      <OutlineButton title="Save Email Signature" icon="download-outline" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lockedRoot: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.black,
  },
  checkLabel: {
    ...typography.body,
    color: colors.black,
  },
  previewCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: layout.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    minHeight: 140,
  },
  previewLeft: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  previewName: {
    ...typography.bodyBold,
    color: colors.black,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
  previewRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniQr: {
    width: 80,
    height: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniCell: {
    width: '20%',
    aspectRatio: 1,
  },
  miniCellFilled: {
    backgroundColor: colors.black,
  },
  connectText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
