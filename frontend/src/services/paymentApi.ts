import { PROFILE_SERVER_URL, profilePublicUrl } from '../config/profileServer';
import { SubscriptionStatus } from '../types/subscription';

export type ServerSubscription = {
  status: SubscriptionStatus;
  planId: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
};

export type PaymentPlan = {
  id: string;
  name: string;
  amountPaise: number;
  currency: string;
  priceLabel: string;
};

export type RazorpayOrderResponse = {
  ok: true;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planId: string;
  planName: string;
};

function ownerHeaders(email: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Owner-Email': email.trim().toLowerCase(),
  };
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
}

export async function fetchPlans(): Promise<PaymentPlan[]> {
  try {
    const res = await fetch(`${PROFILE_SERVER_URL}/api/plans`);
    if (!res.ok) return [];
    const data = (await res.json()) as { plans?: PaymentPlan[] };
    return data.plans ?? [];
  } catch {
    return [];
  }
}

export async function fetchSubscription(
  email: string,
): Promise<{ subscription: ServerSubscription; profileSlug: string } | null> {
  try {
    const res = await fetch(`${PROFILE_SERVER_URL}/api/me/subscription`, {
      headers: ownerHeaders(email),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      subscription: ServerSubscription;
      profileSlug: string;
    };
    return data;
  } catch {
    return null;
  }
}

export async function createRazorpayOrder(
  email: string,
  planId = 'annual',
): Promise<RazorpayOrderResponse> {
  const res = await fetch(`${PROFILE_SERVER_URL}/api/payments/razorpay/create-order`, {
    method: 'POST',
    headers: ownerHeaders(email),
    body: JSON.stringify({ planId }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return (await res.json()) as RazorpayOrderResponse;
}

export function razorpayCheckoutUrl(orderId: string, email: string): string {
  const params = new URLSearchParams({
    order_id: orderId,
    email: email.trim().toLowerCase(),
  });
  return `${PROFILE_SERVER_URL}/pay/checkout?${params.toString()}`;
}

export async function applySubscriptionFromServer(user: {
  email: string;
  profileSlug?: string;
  profileUrl?: string;
}): Promise<{
  subscriptionStatus: SubscriptionStatus;
  profileSlug?: string;
  profileUrl?: string;
}> {
  const data = await fetchSubscription(user.email);
  if (!data) {
    return { subscriptionStatus: 'inactive' };
  }

  const profileSlug = data.profileSlug || user.profileSlug;
  return {
    subscriptionStatus: data.subscription.status,
    profileSlug,
    profileUrl: profileSlug ? profilePublicUrl(profileSlug) : user.profileUrl,
  };
}
