import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTACTS_SYNC_INTERVAL_MS, PROFILE_SYNC_ENABLED } from '../config/profileServer';
import { fetchProfileContacts, resolveProfileApiContext } from './profileApi';
import { Contact } from '../types/contact';

const contactsKey = (ownerEmail: string) =>
  `@justagg/contacts/${ownerEmail.trim().toLowerCase()}`;

const contactsMetaKey = (ownerEmail: string) =>
  `@justagg/contacts-meta/${ownerEmail.trim().toLowerCase()}`;

type ContactsCacheMeta = {
  lastSyncedAt: string | null;
};

async function profileSyncContext() {
  return resolveProfileApiContext(null);
}

function sortContacts(contacts: Contact[]): Contact[] {
  return contacts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function readContacts(ownerEmail: string): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(contactsKey(ownerEmail));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Contact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeContacts(ownerEmail: string, contacts: Contact[]): Promise<void> {
  await AsyncStorage.setItem(contactsKey(ownerEmail), JSON.stringify(contacts));
}

async function readCacheMeta(ownerEmail: string): Promise<ContactsCacheMeta> {
  const raw = await AsyncStorage.getItem(contactsMetaKey(ownerEmail));
  if (!raw) return { lastSyncedAt: null };
  try {
    return JSON.parse(raw) as ContactsCacheMeta;
  } catch {
    return { lastSyncedAt: null };
  }
}

async function writeCacheMeta(ownerEmail: string, meta: ContactsCacheMeta): Promise<void> {
  await AsyncStorage.setItem(contactsMetaKey(ownerEmail), JSON.stringify(meta));
}

let syncInFlight: Promise<Contact[]> | null = null;

export async function getCachedContacts(): Promise<Contact[]> {
  const context = await profileSyncContext();
  if (!context) return [];
  return sortContacts(await readContacts(context.ownerEmail));
}

export async function getContactsCacheMeta(): Promise<ContactsCacheMeta> {
  const context = await profileSyncContext();
  if (!context) return { lastSyncedAt: null };
  return readCacheMeta(context.ownerEmail);
}

export { CONTACTS_SYNC_INTERVAL_MS };

/** Fetch latest contacts from server and update local cache. */
export async function syncContactsFromServer(): Promise<Contact[]> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    if (!PROFILE_SYNC_ENABLED) {
      return getCachedContacts();
    }

    const context = await profileSyncContext();
    if (!context) return getCachedContacts();

    const { slug: profileSlug, ownerEmail } = context;
    const serverContacts = await fetchProfileContacts(profileSlug, ownerEmail);
    const localContacts = await readContacts(ownerEmail);
    const serverIds = new Set(serverContacts.map((c) => c.id));
    const localOnly = localContacts.filter((c) => !serverIds.has(c.id));
    const merged = sortContacts([...serverContacts, ...localOnly]);

    await writeContacts(ownerEmail, merged);
    await writeCacheMeta(ownerEmail, { lastSyncedAt: new Date().toISOString() });
    return merged;
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

export type LoadContactsResult = {
  contacts: Contact[];
  fromCache: boolean;
  lastSyncedAt: string | null;
};

/** Return cached contacts immediately; optionally refresh from server in background. */
export async function loadContactsWithCache(options?: {
  refresh?: boolean;
}): Promise<LoadContactsResult> {
  const context = await profileSyncContext();
  if (!context) {
    return { contacts: [], fromCache: true, lastSyncedAt: null };
  }

  const { ownerEmail } = context;
  const meta = await readCacheMeta(ownerEmail);
  const cached = await getCachedContacts();

  if (!options?.refresh && cached.length > 0) {
    return { contacts: cached, fromCache: true, lastSyncedAt: meta.lastSyncedAt };
  }

  const contacts = await syncContactsFromServer();
  const updatedMeta = await readCacheMeta(ownerEmail);
  return {
    contacts,
    fromCache: false,
    lastSyncedAt: updatedMeta.lastSyncedAt,
  };
}

/** @deprecated Use loadContactsWithCache / syncContactsFromServer */
export async function syncContacts(): Promise<Contact[]> {
  return syncContactsFromServer();
}

export async function saveContact(ownerEmail: string, contact: Contact): Promise<void> {
  const contacts = await readContacts(ownerEmail);
  const index = contacts.findIndex((c) => c.id === contact.id);
  if (index >= 0) {
    contacts[index] = contact;
  } else {
    contacts.push(contact);
  }
  await writeContacts(ownerEmail, contacts);
}

export async function getContactById(
  ownerEmail: string,
  contactId: string,
): Promise<Contact | null> {
  const contacts = await readContacts(ownerEmail);
  return contacts.find((c) => c.id === contactId) ?? null;
}
