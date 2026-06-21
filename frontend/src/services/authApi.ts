import { PROFILE_SERVER_URL, PROFILE_SYNC_ENABLED } from '../config/profileServer';
import { AuthMethod } from '../types/user';

export type AuthUserResponse = {
  email: string;
  fullName: string;
  mobile: string;
  jobTitle: string;
  organization: string;
  location: string;
  about: string;
  profileSlug: string;
  authMethod: AuthMethod;
  createdAt: string;
};

type AuthSuccess = {
  ok: true;
  user: AuthUserResponse;
};

type AuthError = {
  error: string;
};

export type RegisterInput = {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

async function parseAuthResponse(res: Response): Promise<AuthUserResponse> {
  const data = (await res.json()) as AuthSuccess | AuthError;
  if (!res.ok || 'error' in data) {
    throw new Error('error' in data ? data.error : 'Request failed');
  }
  return data.user;
}

export async function registerOnServer(input: RegisterInput): Promise<AuthUserResponse> {
  if (!PROFILE_SYNC_ENABLED) {
    throw new Error('Server auth is disabled.');
  }

  const res = await fetch(`${PROFILE_SERVER_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: input.fullName.trim(),
      mobile: input.mobile.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }),
  });

  return parseAuthResponse(res);
}

export async function loginOnServer(input: LoginInput): Promise<AuthUserResponse> {
  if (!PROFILE_SYNC_ENABLED) {
    throw new Error('Server auth is disabled.');
  }

  const res = await fetch(`${PROFILE_SERVER_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }),
  });

  return parseAuthResponse(res);
}
