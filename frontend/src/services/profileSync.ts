import {
  applyServerProfileToUser,
  ensureProfileOnServer,
  syncProfileToServer,
} from './profileApi';
import { getProfileLinks, serverLinksToSaved } from './profileLinksStorage';
import { saveUser } from './authStorage';
import { appsLinksCatalog } from '../data/appsLinksCatalog';
import { StoredUser } from '../types/user';

const catalogColors = Object.fromEntries(appsLinksCatalog.map((a) => [a.id, a.color]));
const catalogLabels = Object.fromEntries(appsLinksCatalog.map((a) => [a.id, a.label]));

export async function registerAndSyncUser(user: StoredUser): Promise<StoredUser> {
  let next = { ...user };

  const serverProfile = await ensureProfileOnServer(next);
  if (!serverProfile) return next;

  next = applyServerProfileToUser(next, serverProfile);

  const localLinks = await getProfileLinks(next.email);
  const mergedFromServer =
    localLinks.length === 0
      ? serverLinksToSaved(
          serverProfile.links ?? [],
          serverProfile.payments ?? [],
          catalogColors,
          catalogLabels,
        )
      : localLinks;

  if (localLinks.length === 0 && mergedFromServer.length > 0) {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(
      `profile_links:${next.email.trim().toLowerCase()}`,
      JSON.stringify(mergedFromServer),
    );
  }

  const synced = await syncProfileToServer(next, mergedFromServer);
  if (synced) {
    next = applyServerProfileToUser(next, synced);
  }

  await saveUser(next);
  return next;
}

export async function syncUserProfile(user: StoredUser): Promise<StoredUser> {
  if (!user.profileSlug) {
    return registerAndSyncUser(user);
  }

  const links = await getProfileLinks(user.email);
  const synced = await syncProfileToServer(user, links);
  if (!synced) return user;

  const next = applyServerProfileToUser(user, synced);
  await saveUser(next);
  return next;
}
