export type SavedProfileLink = {
  id: string;
  label: string;
  category: string;
  value: string;
  color: string;
  /** When false, link is hidden from the public profile. Defaults to true. */
  enabled?: boolean;
};

export type ProfilePayment = {
  provider: string;
  upiId: string;
};

export type PublicProfile = {
  slug: string;
  ownerEmail: string;
  fullName: string;
  jobTitle: string;
  organization: string;
  about: string;
  mobile: string;
  email: string;
  location: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  leadCaptureEnabled: boolean;
  links: SavedProfileLink[];
  payments: ProfilePayment[];
  updatedAt?: string;
};
