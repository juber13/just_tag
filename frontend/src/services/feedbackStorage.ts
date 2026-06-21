import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedbackEntry } from '../types/feedback';

const FEEDBACK_KEY = '@justagg/feedback';

async function readAll(): Promise<FeedbackEntry[]> {
  const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FeedbackEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveFeedback(entry: FeedbackEntry): Promise<void> {
  const entries = await readAll();
  entries.unshift(entry);
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
}

export async function getFeedbackForUser(userEmail: string): Promise<FeedbackEntry[]> {
  const key = userEmail.trim().toLowerCase();
  const entries = await readAll();
  return entries.filter((e) => e.userEmail === key);
}
