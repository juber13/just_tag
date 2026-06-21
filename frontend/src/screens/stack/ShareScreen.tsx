import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ProfileQrCode } from '../../components/share/ProfileQrCode';
import { QrDownloadButton } from '../../components/share/QrDownloadButton';
import { PROFILE_QR_BACKGROUND, PROFILE_QR_SIZE } from '../../utils/qrConstants';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { MainStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { shareProfileQrImage } from '../../services/profileQrDownload';
import { profilePublicUrl } from '../../config/profileServer';
import { colors, layout, spacing, typography } from '../../theme';

const SHARE_OPTIONS = [
  { icon: 'chatbox-outline' as const, label: 'Share as Texts' },
  { icon: 'mail-outline' as const, label: 'Share as Email' },
  { icon: 'at-outline' as const, label: 'Create Email Signature' },
  { icon: 'color-palette-outline' as const, label: 'Change Theme Color' },
];

export function ShareScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [offline, setOffline] = useState(false);
  const [savingQr, setSavingQr] = useState(false);

  const profileLink = useMemo(() => {
    const url = user?.profileUrl?.trim();
    if (url) return url;
    if (user?.profileSlug) return profilePublicUrl(user.profileSlug);
    return '';
  }, [user?.profileUrl, user?.profileSlug]);

  const goSignature = () => {
    navigation.navigate('SignaturePreview');
  };

  const handleDownloadQr = useCallback(async () => {
    if (!profileLink || savingQr) return;

    setSavingQr(true);
    try {
      const result = await shareProfileQrImage(profileLink, {
        color: colors.black,
        backgroundColor: PROFILE_QR_BACKGROUND,
      });

      switch (result) {
        case 'shared':
          break;
        case 'unavailable':
          Alert.alert(
            'Sharing unavailable',
            'Saving the QR code is not supported on this device.',
          );
          break;
        case 'no_link':
          Alert.alert('No profile link', 'Sign in or set up your profile link first.');
          break;
        case 'failed':
          Alert.alert('Download failed', 'Could not save your QR code. Please try again.');
          break;
      }
    } finally {
      setSavingQr(false);
    }
  }, [profileLink, savingQr]);

  const handleCopyLink = useCallback(async () => {
    if (!profileLink) {
      Alert.alert('No profile link', 'Sign in or set up your profile link first.');
      return;
    }

    try {
      await Clipboard.setStringAsync(profileLink);
      Alert.alert('Copied', 'Profile link copied to clipboard.');
    } catch {
      Alert.alert('Copy failed', 'Could not copy the profile link. Please try again.');
    }
  }, [profileLink]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Share</Text>
      <View style={styles.qrSection}>
        <View style={styles.qrCard}>
          <View style={styles.qrFrame}>
            {profileLink ? (
              <ProfileQrCode
                value={profileLink}
                size={PROFILE_QR_SIZE}
                color={colors.black}
              />
            ) : null}
          </View>
          <View style={styles.downloadOverlay} pointerEvents="box-none">
            <QrDownloadButton
              onPress={handleDownloadQr}
              disabled={!profileLink}
              loading={savingQr}
            />
          </View>
        </View>
      </View>
      <View style={styles.urlRow}>
        <Text style={styles.url} numberOfLines={1}>
          {profileLink}
        </Text>
        <Pressable
          onPress={handleCopyLink}
          disabled={!profileLink}
          style={!profileLink && styles.copyBtnDisabled}
          accessibilityRole="button"
          accessibilityLabel="Copy profile link"
        >
          <Ionicons name="copy-outline" size={22} color={colors.black} />
        </Pressable>
      </View>
      <View style={styles.offlineRow}>
        <Ionicons name="information-circle-outline" size={20} color={colors.black} />
        <Text style={styles.offlineLabel}>Offline Mode</Text>
        <Switch
          value={offline}
          onValueChange={setOffline}
          style={styles.switch}
        />
      </View>
      {SHARE_OPTIONS.map((opt) => (
        <OutlineButton
          key={opt.label}
          title={opt.label}
          icon={opt.icon}
          style={styles.optionBtn}
          onPress={opt.label === 'Create Email Signature' ? goSignature : undefined}
        />
      ))}
      <PrimaryButton title="Share Another Way" style={styles.primary} />
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
    marginBottom: spacing.xl,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrCard: {
    position: 'relative',
    width: 196,
    height: 196,
    borderRadius: 24,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  qrFrame: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: PROFILE_QR_BACKGROUND,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  url: {
    flex: 1,
    ...typography.body,
    color: colors.black,
  },
  copyBtnDisabled: {
    opacity: 0.4,
  },
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  offlineLabel: {
    flex: 1,
    ...typography.body,
    color: colors.black,
  },
  switch: {
    marginLeft: 'auto',
  },
  optionBtn: {
    marginBottom: spacing.md,
  },
  primary: {
    marginTop: spacing.md,
  },
});
