export type Contact = {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  jobTitle: string;
  organization: string;
  location: string;
  createdAt: string;
};

export function createContact(
  partial: Pick<Contact, 'fullName'> & Partial<Omit<Contact, 'fullName'>>,
): Contact {
  return {
    id: partial.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    fullName: partial.fullName.trim(),
    mobile: partial.mobile?.trim() ?? '',
    email: partial.email?.trim() ?? '',
    jobTitle: partial.jobTitle?.trim() ?? '',
    organization: partial.organization?.trim() ?? '',
    location: partial.location?.trim() ?? '',
    createdAt: partial.createdAt ?? new Date().toISOString(),
  };
}
