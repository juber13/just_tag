/** Base URL of your profile server (no trailing slash). */
export const PROFILE_SERVER_URL = 'https://justtag-production.up.railway.app';

/** Set true after starting server/ and syncing once. */
export const PROFILE_SYNC_ENABLED = true;

/** Static profile slug used to fetch contacts from the server. */
export const PROFILE_CONTACTS_SLUG = 'juber';

/** Owner email sent with contacts API (must match profile in DB). */
export const PROFILE_OWNER_EMAIL = 'mallika@example.com';

/** Background contacts sync interval while Contacts screen is open (ms). */
export const CONTACTS_SYNC_INTERVAL_MS = 15_000;

export function profilePublicUrl(slug: string): string {
  return `${PROFILE_SERVER_URL}/p/${slug}`;
}

/** Resolve a server media path (/media/...) or pass through local/data URIs. */
export function profileMediaUrl(path: string | null | undefined): string | undefined {
  if (!path?.trim()) return undefined;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('file://') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  return `${PROFILE_SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
