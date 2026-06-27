import { useAuth } from './AuthContext';
import { isProductActive, SubscriptionStatus } from '../types/subscription';

export function useProductAccess() {
  const { user } = useAuth();
  const subscriptionStatus: SubscriptionStatus = user?.subscriptionStatus ?? 'inactive';

  return {
    subscriptionStatus,
    isProductActive: isProductActive(subscriptionStatus),
  };
}
