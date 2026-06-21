import {
  PROFILE_SERVER_URL,
  PROFILE_SYNC_ENABLED,
  profileMediaUrl,
  profilePublicUrl,
} from '../config/profileServer';
import { Contact } from '../types/contact';
import { PublicProfile, ProfilePayment, SavedProfileLink } from '../types/profile';
import { StoredUser } from '../types/user';

const PAYMENT_IDS = new Set(['google-pay', 'paytm', 'phonepe']);

function ownerHeaders(email: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Owner-Email': email.trim().toLowerCase(),
  };
}

function ownerUploadHeaders(email: string): HeadersInit {
  return {
    'X-Owner-Email': email.trim().toLowerCase(),
  };
}

function splitLinksAndPayments(links: SavedProfileLink[]): {
  links: SavedProfileLink[];
  payments: ProfilePayment[];
} {
  const connect: SavedProfileLink[] = [];
  const payments: ProfilePayment[] = [];
  for (const link of links) {
    if (!link.value?.trim() || link.enabled === false) continue;
    if (PAYMENT_IDS.has(link.id)) {
      payments.push({ provider: link.id, upiId: link.value.trim() });
    } else {
      connect.push(link);
    }
  }
  return { links: connect, payments };
}

export function userToProfilePayload(
  user: StoredUser,
  savedLinks: SavedProfileLink[],
): Omit<PublicProfile, 'slug' | 'ownerEmail' | 'updatedAt'> {
  const { links, payments } = splitLinksAndPayments(savedLinks);
  return {
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    organization: user.organization,
    about: user.about ?? '',
    mobile: user.mobile,
    email: user.email,
    location: user.location,
    avatarUrl: null,
    coverUrl: null,
    leadCaptureEnabled: user.leadCaptureEnabled !== false,
    links,
    payments,
  };
}

export async function ensureProfileOnServer(user: StoredUser): Promise<PublicProfile | null> {
  if (!PROFILE_SYNC_ENABLED) return null;
  const email = user.email.trim().toLowerCase();
  try {
    const byEmail = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/by-email/${encodeURIComponent(email)}`,
    );
    if (byEmail.ok) return (await byEmail.json()) as PublicProfile;
    const byProfileKey = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(email)}`,
    );
    if (byProfileKey.ok) return (await byProfileKey.json()) as PublicProfile;
    const created = await fetch(`${PROFILE_SERVER_URL}/api/profiles`, {
      method: 'POST',
      headers: ownerHeaders(email),
      body: JSON.stringify({
        ownerEmail: email,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        jobTitle: user.jobTitle,
        organization: user.organization,
        location: user.location,
        about: user.about ?? '',
      }),
    });
    if (!created.ok) return null;
    return (await created.json()) as PublicProfile;
  } catch {
    return null;
  }
}

export async function syncProfileToServer(
  user: StoredUser,
  savedLinks: SavedProfileLink[],
): Promise<PublicProfile | null> {
  if (!PROFILE_SYNC_ENABLED || !user.profileSlug) return null;
  const payload = userToProfilePayload(user, savedLinks);
  try {
    const res = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(user.profileSlug)}`,
      {
        method: 'PUT',
        headers: ownerHeaders(user.email),
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicProfile;
  } catch {
    return null;
  }
}

export async function uploadProfileImage(
  slug: string,
  ownerEmail: string,
  kind: 'avatar' | 'cover',
  localUri: string,
): Promise<PublicProfile | null> {
  if (!PROFILE_SYNC_ENABLED || !slug.trim() || !localUri.startsWith('file://')) return null;
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: `${kind}.jpg`,
    } as unknown as Blob);

    const res = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(slug)}/${kind}`,
      {
        method: 'POST',
        headers: ownerUploadHeaders(ownerEmail),
        body: formData,
      },
    );
    if (!res.ok) {
      console.warn(`[profile] ${kind} upload failed (${res.status}) for slug=${slug}`);
      return null;
    }
    return (await res.json()) as PublicProfile;
  } catch (error) {
    console.warn(`[profile] ${kind} upload error:`, error);
    return null;
  }
}

export type ProfileDetailsUpdate = {
  fullName: string;
  jobTitle: string;
  organization: string;
  about: string;
};

export async function updateProfileDetails(
  slug: string,
  ownerEmail: string,
  details: ProfileDetailsUpdate,
): Promise<PublicProfile | null> {
  if (!PROFILE_SYNC_ENABLED || !slug.trim()) return null;
  try {
    const res = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(slug)}`,
      {
        method: 'PUT',
        headers: ownerHeaders(ownerEmail),
        body: JSON.stringify({
          fullName: details.fullName.trim(),
          jobTitle: details.jobTitle.trim(),
          organization: details.organization.trim(),
          about: details.about.trim(),
        }),
      },
    );
    if (!res.ok) {
      console.warn(`[profile] update failed (${res.status}) for slug=${slug}`);
      return null;
    }
    return (await res.json()) as PublicProfile;
  } catch (error) {
    console.warn('[profile] update error:', error);
    return null;
  }
}

export type LeadCaptureUpdateResult =
  | { ok: true; enabled: boolean }
  | { ok: false; error: string };

export async function updateLeadCaptureEnabled(
  slug: string,
  ownerEmail: string,
  enabled: boolean,
): Promise<LeadCaptureUpdateResult> {
  if (!PROFILE_SYNC_ENABLED || !slug.trim()) {
    return { ok: false, error: 'Profile sync is disabled or slug is missing' };
  }
  if (!ownerEmail.trim()) {
    return { ok: false, error: 'Owner email is required' };
  }
  try {
    const res = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(slug)}/lead-capture`,
      {
        method: 'PATCH',
        headers: ownerHeaders(ownerEmail),
        body: JSON.stringify({ leadCaptureEnabled: enabled }),
      },
    );
    if (!res.ok) {
      let message = `Server returned ${res.status}`;
      try {
        const err = (await res.json()) as { error?: string };
        if (err.error) message = err.error;
      } catch {
        // ignore parse errors
      }
      console.warn(`[profile] lead-capture update failed (${res.status}) for slug=${slug}`);
      return { ok: false, error: message };
    }
    const data = (await res.json()) as { leadCaptureEnabled?: boolean };
    return { ok: true, enabled: data.leadCaptureEnabled !== false };
  } catch (error) {
    console.warn('[profile] lead-capture update error:', error);
    return { ok: false, error: 'Network error — could not reach profile server' };
  }
}

export async function fetchPublicProfile(slug: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicProfile;
  } catch {
    return null;
  }
}

export function applyServerProfileToUser(user: StoredUser, server: PublicProfile): StoredUser {
  return {
    ...user,
    profileSlug: server.slug,
    profileUrl: profilePublicUrl(server.slug),
    fullName: server.fullName || user.fullName,
    jobTitle: server.jobTitle || user.jobTitle,
    organization: server.organization || user.organization,
    about: server.about ?? user.about,
    mobile: server.mobile || user.mobile,
    location: server.location || user.location,
    avatarImageUri: profileMediaUrl(server.avatarUrl),
    coverImageUri: profileMediaUrl(server.coverUrl),
    leadCaptureEnabled: server.leadCaptureEnabled !== false,
  };
}

export async function checkProfileServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${PROFILE_SERVER_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

type ServerContactPayload = {
  id: string;
  fullName?: string;
  name?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  jobTitle?: string;
  organization?: string;
  company?: string;
  location?: string;
  createdAt?: string;
};

function serverContactToContact(raw: ServerContactPayload): Contact {
  return {
    id: raw.id,
    fullName: (raw.fullName ?? raw.name ?? '').trim(),
    mobile: (raw.mobile ?? raw.phone ?? '').trim(),
    email: (raw.email ?? '').trim(),
    jobTitle: (raw.jobTitle ?? '').trim(),
    organization: (raw.organization ?? raw.company ?? '').trim(),
    location: (raw.location ?? '').trim(),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export async function resolveProfileSlug(user: StoredUser): Promise<string | null> {
  if (user.profileSlug?.trim()) return user.profileSlug.trim();
  const email = user.email.trim().toLowerCase();
  if (!email || !PROFILE_SYNC_ENABLED) return null;
  const profile =
    (await fetchPublicProfile(email)) ??
    (user.fullName?.trim() ? await fetchPublicProfile(user.fullName.trim()) : null);
  return profile?.slug?.trim() ?? null;
}

export async function fetchProfileContacts(slug: string, ownerEmail: string): Promise<Contact[]> {
  if (!PROFILE_SYNC_ENABLED || !slug.trim()) return [];
  try {
    const res = await fetch(
      `${PROFILE_SERVER_URL}/api/profiles/${encodeURIComponent(slug)}/contacts`,
      { headers: ownerHeaders(ownerEmail) },
    );
    if (!res.ok) {
      console.warn(`[contacts] fetch failed (${res.status}) for slug=${slug}`);
      return [];
    }
    const data = (await res.json()) as ServerContactPayload[];
    return Array.isArray(data) ? data.map(serverContactToContact) : [];
  } catch (error) {
    console.warn('[contacts] fetch error:', error);
    return [];
  }
}
