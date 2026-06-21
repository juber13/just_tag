export type FeedbackCategory =
  | 'general'
  | 'bug'
  | 'feature'
  | 'device'
  | 'other';

export const FEEDBACK_CATEGORIES: {
  id: FeedbackCategory;
  label: string;
}[] = [
  { id: 'general', label: 'General' },
  { id: 'bug', label: 'Bug Report' },
  { id: 'feature', label: 'Feature Request' },
  { id: 'device', label: 'Device' },
  { id: 'other', label: 'Other' },
];

export type FeedbackEntry = {
  id: string;
  userEmail: string;
  userName: string;
  category: FeedbackCategory;
  rating: number;
  message: string;
  createdAt: string;
};

export function createFeedbackEntry(
  partial: Pick<
    FeedbackEntry,
    'userEmail' | 'userName' | 'category' | 'rating' | 'message'
  >,
): FeedbackEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userEmail: partial.userEmail.trim().toLowerCase(),
    userName: partial.userName.trim(),
    category: partial.category,
    rating: partial.rating,
    message: partial.message.trim(),
    createdAt: new Date().toISOString(),
  };
}
