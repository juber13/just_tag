import { Linking } from 'react-native';
import { FEEDBACK_CATEGORIES, FeedbackEntry } from '../types/feedback';

export const FEEDBACK_SUPPORT_EMAIL = 'support@justagg.com';

export function buildFeedbackMailUrl(entry: FeedbackEntry): string {
  const categoryLabel =
    FEEDBACK_CATEGORIES.find((c) => c.id === entry.category)?.label ?? entry.category;
  const subject = `Justagg Feedback: ${categoryLabel}`;
  const body = [
    `Category: ${categoryLabel}`,
    `Rating: ${entry.rating}/5`,
    '',
    entry.message,
    '',
    '---',
    `From: ${entry.userName}`,
    entry.userEmail ? `Email: ${entry.userEmail}` : '',
    `Submitted: ${new Date(entry.createdAt).toLocaleString()}`,
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${FEEDBACK_SUPPORT_EMAIL}?${params.toString()}`;
}

export async function openFeedbackEmail(entry: FeedbackEntry): Promise<boolean> {
  const url = buildFeedbackMailUrl(entry);
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
