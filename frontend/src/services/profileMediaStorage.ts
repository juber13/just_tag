import AsyncStorage from '@react-native-async-storage/async-storage';

/** Legacy global keys — no longer used; cleared on login/logout. */
const LEGACY_COVER_URI_KEY = '@justagg/profile/cover-uri';
const LEGACY_AVATAR_URI_KEY = '@justagg/profile/avatar-uri';

export async function clearLegacyProfileMedia(): Promise<void> {
  await AsyncStorage.multiRemove([LEGACY_COVER_URI_KEY, LEGACY_AVATAR_URI_KEY]);
}
