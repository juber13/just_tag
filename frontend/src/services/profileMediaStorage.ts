import AsyncStorage from '@react-native-async-storage/async-storage';

const COVER_URI_KEY = '@justagg/profile/cover-uri';
const AVATAR_URI_KEY = '@justagg/profile/avatar-uri';

export async function getCoverUri(): Promise<string | null> {
  return AsyncStorage.getItem(COVER_URI_KEY);
}

export async function getAvatarUri(): Promise<string | null> {
  return AsyncStorage.getItem(AVATAR_URI_KEY);
}

export async function saveCoverUri(uri: string): Promise<void> {
  await AsyncStorage.setItem(COVER_URI_KEY, uri);
}

export async function saveAvatarUri(uri: string): Promise<void> {
  await AsyncStorage.setItem(AVATAR_URI_KEY, uri);
}

export async function loadProfileMedia(): Promise<{
  coverUri: string | null;
  avatarUri: string | null;
}> {
  const [coverUri, avatarUri] = await Promise.all([getCoverUri(), getAvatarUri()]);
  return { coverUri, avatarUri };
}
