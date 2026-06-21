/** Base URL of your profile server (no trailing slash). */
export const PROFILE_SERVER_URL = 'http://192.168.0.100:3001';

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
