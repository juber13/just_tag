import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredUser } from '../types/user';

const SESSION_KEY = '@justagg/session';
const USERS_KEY = '@justagg/users';

export type Session = {
  email: string;
  loggedInAt: string;
};

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function setSession(email: string): Promise<void> {
  const session: Session = {
    email: email.trim().toLowerCase(),
    loggedInAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function saveUser(user: StoredUser): Promise<void> {
  const users = await readUsers();
  const email = user.email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email === email);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await writeUsers(users);
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
}

export async function getLoggedInUser(): Promise<StoredUser | null> {
  const session = await getSession();
  if (!session) return null;
  return getUserByEmail(session.email);
}
