export type AuthMethod = 'email' | 'facebook' | 'google';

export type StoredUser = {
  fullName: string;
  mobile: string;
  email: string;
  password?: string;
  jobTitle: string;
  organization: string;
  location: string;
  profileUrl: string;
  profileSlug?: string;
  about?: string;
  coverImageUri?: string;
  avatarImageUri?: string;
  authMethod: AuthMethod;
  createdAt: string;
};

import { profilePublicUrl } from '../config/profileServer';

export const defaultProfileUrl = (slug: string) => profilePublicUrl(slug);

export function createStoredUser(
  partial: Pick<StoredUser, 'fullName' | 'email'> &
    Partial<Omit<StoredUser, 'fullName' | 'email'>>,
): StoredUser {
  const email = partial.email.trim().toLowerCase();
  return {
    fullName: partial.fullName.trim(),
    mobile: partial.mobile?.trim() ?? '',
    email,
    password: partial.password,
    jobTitle: partial.jobTitle ?? '',
    organization: partial.organization ?? '',
    location: partial.location ?? '',
    profileUrl: partial.profileUrl ?? (partial.profileSlug ? defaultProfileUrl(partial.profileSlug) : ''),
    authMethod: partial.authMethod ?? 'email',
    createdAt: partial.createdAt ?? new Date().toISOString(),
  };
}
