export type SubscriptionStatus = 'inactive' | 'active';

export function isProductActive(status?: SubscriptionStatus | null): boolean {
  return status === 'active';
}
