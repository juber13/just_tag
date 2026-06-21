import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ExpoFileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileSavedLinksList } from '../../components/apps/ProfileSavedLinksList';
import { MainTabParamList, ProfileStackParamList } from '../../navigation/types';
import { colors, layout, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  PROFILE_CONTACTS_SLUG,
  PROFILE_OWNER_EMAIL,
  profileMediaUrl,
} from '../../config/profileServer';
import {
  applyServerProfileToUser,
  fetchPublicProfile,
  resolveProfileSlug,
  updateLeadCaptureEnabled,
  updateProfileDetails,
  uploadProfileImage,
} from '../../services/profileApi';
import {
  getProfileLinks,
  reorderProfileLinks,
  setProfileLinkEnabled,
} from '../../services/profileLinksStorage';
import { syncUserProfile } from '../../services/profileSync';
import { SavedProfileLink } from '../../types/profile';
import {
  pickProfileImage,
  PickTarget,
  showImageSourceSheet,
} from '../../utils/mediaPicker';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

const BANNER_HEIGHT = 180;

async function deleteLocalImage(uri?: string | null) {
  if (!uri?.startsWith('file://')) return;
  try {
    await ExpoFileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Picker cache files may already be gone; safe to ignore.
  }
}

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabNav = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
  const { user, updateUser, patchUserLocal } = useAuth();
  const [mode, setMode] = useState<'Business' | 'Social'>('Business');
  const [leadOn, setLeadOn] = useState(true);
  const [personalOn, setPersonalOn] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const pickingRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [about, setAbout] = useState('');
  const [savedLinks, setSavedLinks] = useState<SavedProfileLink[]>([]);

  const profileSlug = user?.profileSlug ?? PROFILE_CONTACTS_SLUG;
  const ownerEmail = user?.email?.trim().toLowerCase() ?? '';

  const resolveSlugForUser = useCallback(async () => {
    if (!user) return null;
    return (await resolveProfileSlug(user)) ?? user.profileSlug?.trim() ?? null;
  }, [user]);

  const applyProfileFields = useCallback(
    (fields: {
      fullName?: string;
      jobTitle?: string;
      about?: string;
    }) => {
      setFullName(fields.fullName ?? '');
      setJobTitle(fields.jobTitle ?? '');
      setAbout(fields.about ?? '');
    },
    [],
  );

  const loadSavedLinks = useCallback(async () => {
    if (!user?.email) {
      setSavedLinks([]);
      return;
    }
    const links = await getProfileLinks(user.email);
    setSavedLinks(links.filter((l) => l.value.trim()));
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    applyProfileFields(user);
  }, [user, applyProfileFields]);

  const loadProfileFromServer = useCallback(async () => {
    const slug = await resolveSlugForUser();
    if (!slug) return;
    const serverProfile = await fetchPublicProfile(slug);
    if (!serverProfile) return;
    applyProfileFields(serverProfile);
    setLeadOn(serverProfile.leadCaptureEnabled !== false);
    setCoverUri(profileMediaUrl(serverProfile.coverUrl) ?? null);
    setAvatarUri(profileMediaUrl(serverProfile.avatarUrl) ?? null);
  }, [applyProfileFields, resolveSlugForUser]);

  useFocusEffect(
    useCallback(() => {
      void loadProfileFromServer();
      void loadSavedLinks();
    }, [loadProfileFromServer, loadSavedLinks]),
  );

  useEffect(() => {
    setCoverUri(user?.coverImageUri ?? null);
    setAvatarUri(user?.avatarImageUri ?? null);
  }, [user?.email, user?.coverImageUri, user?.avatarImageUri]);

  const applyImage = useCallback(
    async (target: PickTarget, uri: string) => {
      if (target === 'banner') {
        setCoverUri(uri);
        await patchUserLocal({ coverImageUri: uri });
      } else {
        setAvatarUri(uri);
        await patchUserLocal({ avatarImageUri: uri });
      }

      if (!user) return;

      const slug = user.profileSlug ?? (await resolveProfileSlug(user));
      if (!slug || !ownerEmail || !uri.startsWith('file://')) return;

      const kind = target === 'banner' ? 'cover' : 'avatar';
      const serverProfile = await uploadProfileImage(slug, ownerEmail, kind, uri);
      if (!serverProfile) {
        Alert.alert('Upload failed', `Could not upload ${kind} image. Check server connection.`);
        return;
      }

      const remoteUri = kind === 'cover'
        ? profileMediaUrl(serverProfile.coverUrl)
        : profileMediaUrl(serverProfile.avatarUrl);
      if (remoteUri) {
        if (kind === 'cover') {
          setCoverUri(remoteUri);
          await patchUserLocal({ coverImageUri: remoteUri });
        } else {
          setAvatarUri(remoteUri);
          await patchUserLocal({ avatarImageUri: remoteUri });
        }
        await deleteLocalImage(uri);
      }
    },
    [patchUserLocal, user, ownerEmail],
  );

  const handlePick = useCallback(
    async (source: 'camera' | 'gallery', target: PickTarget) => {
      if (pickingRef.current) return;
      pickingRef.current = true;
      setPicking(true);
      try {
        const uri = await pickProfileImage(source, target);
        if (!uri) return;
        await applyImage(target, uri);
      } finally {
        pickingRef.current = false;
        setPicking(false);
      }
    },
    [applyImage],
  );

  const openPicker = (target: PickTarget) => {
    if (picking) return;
    showImageSourceSheet(
      target === 'banner' ? 'Edit cover photo' : 'Edit profile photo',
      (source) => {
        void handlePick(source, target);
      },
    );
  };

  const handleEditOrSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    setSaving(true);
    try {
      const serverProfile = await updateProfileDetails(profileSlug, ownerEmail, {
        fullName,
        jobTitle,
        organization: user?.organization ?? '',
        about,
      });

      if (!serverProfile) {
        Alert.alert('Save failed', 'Could not update profile. Check server connection.');
        return;
      }

      if (user) {
        await updateUser(
          applyServerProfileToUser(user, {
            ...serverProfile,
            slug: serverProfile.slug ?? profileSlug,
            ownerEmail: serverProfile.ownerEmail ?? ownerEmail,
            fullName,
            jobTitle,
            organization: user.organization,
            about,
          }),
        );
      }

      setIsEditing(false);
      Alert.alert('Saved', 'Profile details updated.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) applyProfileFields(user);
    setIsEditing(false);
  };

  const handleLeadToggle = async (enabled: boolean) => {
    if (!user) return;
    if (!ownerEmail) {
      Alert.alert('Sign in required', 'Please sign in to change lead capture settings.');
      return;
    }

    const slug = await resolveSlugForUser();
    if (!slug) {
      Alert.alert('Profile not found', 'Your account is not linked to a public profile on the server.');
      return;
    }

    const previous = leadOn;
    setLeadOn(enabled);
    const result = await updateLeadCaptureEnabled(slug, ownerEmail, enabled);
    if (!result.ok) {
      setLeadOn(previous);
      Alert.alert('Update failed', result.error);
      return;
    }
    setLeadOn(result.enabled);
    await patchUserLocal({ leadCaptureEnabled: result.enabled, profileSlug: slug });
  };

  const handleLinkToggle = async (link: SavedProfileLink, enabled: boolean) => {
    if (!user) return;
    const next = await setProfileLinkEnabled(user.email, link.id, enabled);
    setSavedLinks(next.filter((l) => l.value.trim()));
    await syncUserProfile(user);
  };

  const handleLinkReorder = async (ordered: SavedProfileLink[]) => {
    if (!user) return;
    setSavedLinks(ordered);
    const next = await reorderProfileLinks(
      user.email,
      ordered.map((l) => l.id),
    );
    setSavedLinks(next.filter((l) => l.value.trim()));
    void syncUserProfile(user);
  };

  const displayCover = coverUri ?? user?.coverImageUri ?? null;
  const displayAvatar = avatarUri ?? user?.avatarImageUri ?? null;
  const coverOverlayColor = displayCover ? colors.white : colors.black;
  const coverHeight = BANNER_HEIGHT + insets.top;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.cover, { height: coverHeight }]} pointerEvents="box-none">
          {displayCover ? (
            <Image source={{ uri: displayCover }} style={styles.coverImage} resizeMode="cover" />
          ) : null}
          <View
            style={[styles.coverOverlay, { paddingTop: insets.top + spacing.sm }]}
            pointerEvents="box-none"
          >
            <View style={styles.coverTopBar} pointerEvents="box-none">
              <View style={styles.coverSideSlot}>
                <Pressable style={styles.coverIconBtn} hitSlop={8}>
                  <Ionicons name="scan-outline" size={22} color={coverOverlayColor} />
                </Pressable>
              </View>
              <View style={styles.coverCenterSlot}>
                <Pressable
                  style={[styles.modePill, mode === 'Social' && styles.modePillSocial]}
                  onPress={() => setMode((m) => (m === 'Business' ? 'Social' : 'Business'))}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={mode === 'Business' ? colors.white : colors.black}
                  />
                  <Text style={[styles.modeText, mode === 'Social' && styles.modeTextSocial]}>
                    {mode}
                  </Text>
                </Pressable>
              </View>
              <View style={[styles.coverSideSlot, styles.coverSideSlotRight]}>
                <Pressable
                  style={styles.coverIconBtn}
                  onPress={() => tabNav?.navigate('ShareTab')}
                  accessibilityLabel="Share"
                  hitSlop={8}
                >
                  <Ionicons name="share-outline" size={24} color={coverOverlayColor} />
                </Pressable>
                <Pressable
                  style={styles.bannerEdit}
                  onPress={() => openPicker('banner')}
                  disabled={picking}
                  hitSlop={12}
                  accessibilityLabel="Edit cover photo"
                >
                  <Ionicons name="pencil" size={14} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={64} color={colors.textSecondary} />
              )}
            </View>
            <Pressable
              style={styles.avatarEdit}
              onPress={() => openPicker('avatar')}
              disabled={picking}
              hitSlop={12}
              accessibilityLabel="Edit profile photo"
            >
              <Ionicons name="pencil" size={12} color={colors.white} />
            </Pressable>
          </View>
          <View style={styles.toggles}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Lead</Text>
              <View style={styles.switchWrap}>
                <Switch
                  value={leadOn}
                  onValueChange={(enabled) => void handleLeadToggle(enabled)}
                  trackColor={{ false: colors.borderLight, true: colors.toggleGreen }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Personal</Text>
              <View style={styles.switchWrap}>
                <Switch
                  value={personalOn}
                  onValueChange={setPersonalOn}
                  trackColor={{ false: colors.borderLight, true: colors.toggleGreen }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.fields}>
          <TextInput
            style={[styles.field, !isEditing && styles.fieldReadOnly]}
            placeholder="Full Name"
            placeholderTextColor={colors.placeholder}
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
          />
          <TextInput
            style={[styles.field, !isEditing && styles.fieldReadOnly]}
            placeholder="Designation"
            placeholderTextColor={colors.placeholder}
            value={jobTitle}
            onChangeText={setJobTitle}
            editable={isEditing}
          />
          <View style={styles.aboutRow}>
            <TextInput
              style={[styles.field, styles.aboutField, !isEditing && styles.fieldReadOnly]}
              placeholder="About Me"
              placeholderTextColor={colors.placeholder}
              value={about}
              onChangeText={setAbout}
              editable={isEditing}
              multiline
            />
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
          </View>
        </View>

        <Pressable
          style={[styles.editBtn, saving && styles.editBtnDisabled]}
          onPress={() => void handleEditOrSave()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.editBtnText}>{isEditing ? 'Save Details' : 'Edit Details'}</Text>
          )}
        </Pressable>
        {isEditing ? (
          <Pressable style={styles.cancelBtn} onPress={handleCancelEdit} disabled={saving}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        ) : null}

        <View style={styles.linksSection}>
          <Text style={styles.linksSectionTitle}>Apps & Links</Text>
          {savedLinks.length > 0 ? (
            <ProfileSavedLinksList
              links={savedLinks}
              onReorder={(ordered) => void handleLinkReorder(ordered)}
              onToggle={(link, enabled) => void handleLinkToggle(link, enabled)}
            />
          ) : (
            <Text style={styles.linksEmpty}>
              Tap + to add apps and links. Long-press the handle to drag and reorder.
            </Text>
          )}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AppsLinksStore')}>
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingBottom: 100 },
  cover: { backgroundColor: colors.inputBg, position: 'relative', overflow: 'hidden' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10, elevation: 6 },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  coverTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  coverSideSlot: { width: 88, flexDirection: 'row', alignItems: 'center' },
  coverSideSlotRight: { justifyContent: 'flex-end', gap: spacing.sm },
  coverCenterSlot: { flex: 1, alignItems: 'center' },
  coverIconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  bannerEdit: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillSocial: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  modeTextSocial: { color: colors.black },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.pillRadius,
  },
  modeText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  profileRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    alignItems: 'flex-start',
  },
  avatarWrap: { position: 'relative', marginTop: -50 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarEdit: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  toggles: { flex: 1, marginLeft: spacing.md, marginTop: 16, gap: 6 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  toggleLabel: { ...typography.bodyBold, fontSize: 15, color: colors.black },
  switchWrap: { transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }] },
  fields: { paddingHorizontal: layout.screenPadding, marginTop: spacing.lg, gap: spacing.md },
  field: {
    backgroundColor: colors.inputBg,
    borderRadius: layout.pillRadius,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.black,
  },
  fieldReadOnly: { opacity: 0.85 },
  aboutRow: { position: 'relative' },
  aboutField: { paddingRight: 44 },
  infoIcon: { position: 'absolute', right: spacing.md, top: 15 },
  editBtn: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.xl,
    height: 52,
    borderRadius: layout.pillRadius,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnDisabled: { opacity: 0.7 },
  editBtnText: { ...typography.bodyBold, color: colors.white },
  cancelBtn: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { ...typography.bodyBold, color: colors.textSecondary },
  linksSection: { paddingHorizontal: layout.screenPadding, marginTop: spacing.lg },
  linksSectionTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  linksEmpty: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: layout.screenPadding,
    bottom: 16,
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
});
