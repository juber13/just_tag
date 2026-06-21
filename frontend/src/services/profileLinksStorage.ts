import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterCatalogLinks, isCatalogLinkId } from '../data/appsLinksCatalog';
import { SavedProfileLink } from '../types/profile';

const prefix = (email: string) => `profile_links:${email.trim().toLowerCase()}`;

export async function getProfileLinks(email: string): Promise<SavedProfileLink[]> {
  const raw = await AsyncStorage.getItem(prefix(email));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedProfileLink[];
    const normalized = filterCatalogLinks(parsed);
    const needsCleanup = parsed.some((link) => !link.value.trim() || !isCatalogLinkId(link.id));
    if (needsCleanup) {
      await AsyncStorage.setItem(prefix(email), JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return [];
  }
}

export async function saveProfileLink(
  email: string,
  link: SavedProfileLink,
): Promise<SavedProfileLink[]> {
  const existing = await getProfileLinks(email);
  if (!isCatalogLinkId(link.id)) return existing;
  const prev = existing.find((l) => l.id === link.id);
  const next = existing.filter((l) => l.id !== link.id);
  if (link.value.trim()) {
    next.push({
      ...link,
      enabled: link.enabled ?? prev?.enabled ?? true,
    });
  }
  await AsyncStorage.setItem(prefix(email), JSON.stringify(next));
  return next;
}

export async function setProfileLinkEnabled(
  email: string,
  id: string,
  enabled: boolean,
): Promise<SavedProfileLink[]> {
  const existing = await getProfileLinks(email);
  const next = existing.map((l) => (l.id === id ? { ...l, enabled } : l));
  await AsyncStorage.setItem(prefix(email), JSON.stringify(next));
  return next;
}

export async function reorderProfileLinks(
  email: string,
  orderedIds: string[],
): Promise<SavedProfileLink[]> {
  const existing = await getProfileLinks(email);
  const byId = new Map(existing.map((l) => [l.id, l]));
  const orderedSet = new Set(orderedIds);
  const reordered = orderedIds.map((id) => byId.get(id)).filter((l): l is SavedProfileLink => !!l);
  const rest = existing.filter((l) => !orderedSet.has(l.id));
  const next = [...reordered, ...rest];
  await AsyncStorage.setItem(prefix(email), JSON.stringify(next));
  return next;
}

export async function removeProfileLink(email: string, id: string): Promise<SavedProfileLink[]> {
  const existing = await getProfileLinks(email);
  const next = existing.filter((l) => l.id !== id);
  await AsyncStorage.setItem(prefix(email), JSON.stringify(next));
  return next;
}
