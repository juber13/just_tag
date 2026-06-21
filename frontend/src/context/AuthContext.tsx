import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  clearSession,
  getLoggedInUser,
  getUserByEmail,
  saveUser,
  setSession,
} from '../services/authStorage';
import { loginOnServer, registerOnServer } from '../services/authApi';
import { AUTH_ENABLED, GUEST_USER } from '../config/appConfig';
import { registerAndSyncUser, syncUserProfile } from '../services/profileSync';
import { loadProfileMedia } from '../services/profileMediaStorage';
import { AuthMethod, createStoredUser, StoredUser } from '../types/user';
import { colors } from '../theme';

const guestUser = () =>
  createStoredUser({
    ...GUEST_USER,
    authMethod: 'email',
  });

type SignUpInput = {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: StoredUser | null;
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signInWithProvider: (method: Exclude<AuthMethod, 'email'>, email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<StoredUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function mergeUserWithProfileMedia(base: StoredUser): Promise<StoredUser> {
  const media = await loadProfileMedia();
  return {
    ...base,
    ...(media.coverUri ? { coverImageUri: media.coverUri } : {}),
    ...(media.avatarUri ? { avatarImageUri: media.avatarUri } : {}),
  };
}

function serverAuthToStoredUser(
  authUser: Awaited<ReturnType<typeof loginOnServer>>,
): StoredUser {
  return createStoredUser({
    fullName: authUser.fullName,
    mobile: authUser.mobile,
    email: authUser.email,
    jobTitle: authUser.jobTitle,
    organization: authUser.organization,
    location: authUser.location,
    about: authUser.about,
    profileSlug: authUser.profileSlug,
    profileUrl: authUser.profileSlug ? profilePublicUrl(authUser.profileSlug) : '',
    authMethod: authUser.authMethod,
    createdAt: authUser.createdAt,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<StoredUser | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!AUTH_ENABLED) {
          const base = guestUser();
          const stored = await getUserByEmail(base.email);
          const merged = await mergeUserWithProfileMedia(
            stored ? { ...base, ...stored } : base,
          );
          const synced = await registerAndSyncUser(merged);
          if (mounted) setUser(synced);
          return;
        }

        const stored = await getLoggedInUser();
        if (mounted) {
          if (stored) {
            const merged = await mergeUserWithProfileMedia(stored);
            setUser(await registerAndSyncUser(merged));
          } else {
            setUser(null);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const completeLogin = useCallback(async (nextUser: StoredUser) => {
    const synced = await registerAndSyncUser(nextUser);
    await setSession(synced.email);
    setUser(synced);
  }, []);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const authUser = await registerOnServer(input);
      const nextUser = serverAuthToStoredUser(authUser);
      await completeLogin(nextUser);
    },
    [completeLogin],
  );

  const signIn = useCallback(
    async (input: SignInInput) => {
      const authUser = await loginOnServer(input);
      const nextUser = serverAuthToStoredUser(authUser);
      await completeLogin(nextUser);
    },
    [completeLogin],
  );

  const signInWithProvider = useCallback(
    async (method: Exclude<AuthMethod, 'email'>, email?: string) => {
      const placeholderEmail =
        email?.trim().toLowerCase() ||
        `${method}@justagg.local`;

      const existing = await getUserByEmail(placeholderEmail);

      const nextUser =
        existing ??
        createStoredUser({
          fullName: method === 'facebook' ? 'Facebook User' : 'Google User',
          mobile: '',
          email: placeholderEmail,
          authMethod: method,
        });

      await completeLogin({ ...nextUser, authMethod: method });
    },
    [completeLogin],
  );

  const signOut = useCallback(async () => {
    if (!AUTH_ENABLED) {
      const merged = await mergeUserWithProfileMedia(guestUser());
      setUser(await registerAndSyncUser(merged));
      return;
    }
    await clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (patch: Partial<StoredUser>) => {
    const current = userRef.current;
    if (!current) return;

    const nextUser = { ...current, ...patch };
    await saveUser(nextUser);
    setUser(nextUser);
    const synced = await syncUserProfile(nextUser);
    setUser(synced);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signUp,
      signIn,
      signInWithProvider,
      signOut,
      updateUser,
    }),
    [user, isLoading, signUp, signIn, signInWithProvider, signOut, updateUser],
  );

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
