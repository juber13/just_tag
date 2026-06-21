import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedProfileLink } from '../types/profile';

const prefix = (email: string) => `profile_links:${email.trim().toLowerCase()}`;

export async function getProfileLinks(email: string): Promise<SavedProfileLink[]> {
  const raw = await AsyncStorage.getItem(prefix(email));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedProfileLink[];
  } catch {
    return [];
  }
}

export async function saveProfileLink(
  email: string,
  link: SavedProfileLink,
): Promise<SavedProfileLink[]> {
  const existing = await getProfileLinks(email);
  const next = existing.filter((l) => l.id !== link.id);
  if (link.value.trim()) {
    next.push(link);
  }
  await AsyncStorage.setItem(prefix(email), JSON.stringify(next));
  return next;
}

export async function removeProfileLink(email: string, id: string): Promise<SavedProfileLink[]> {
  const existing = await getProfileLinks(email);
  const next = existing.filter((l) => l.id !== id);
  await AsyncStorage.setItem(prefix(email), JSON.stringify(next));
  return next;
}

export function serverLinksToSaved(
  links: SavedProfileLink[],
  payments: { provider: string; upiId: string }[],
  catalogColors: Record<string, string>,
  catalogLabels: Record<string, string>,
): SavedProfileLink[] {
  const paymentLinks: SavedProfileLink[] = payments.map((p) => ({
    id: p.provider,
    label: catalogLabels[p.provider] ?? p.provider,
    category: 'Payment',
    value: p.upiId,
    color: catalogColors[p.provider] ?? '#333',
  }));
  return [...links, ...paymentLinks];
}
