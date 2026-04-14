import { useState, useCallback } from 'react';
import { client, type UserProfile } from '../lib/api';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await client.models.UserProfile.list();
      const p = result.data?.[0];
      if (p) {
        setProfile({
          id: p.id,
          email: p.email,
          stripeCustomerId: p.stripeCustomerId ?? null,
          subscriptionStatus: p.subscriptionStatus ?? 'inactive',
          subscriptionEndDate: p.subscriptionEndDate ?? null,
          isFoundingMember: p.isFoundingMember ?? false,
          currency: p.currency ?? 'USD',
          businessName: p.businessName ?? null,
          fullName: p.fullName ?? null,
          phone: p.phone ?? null,
          address: p.address ?? null,
          abn: p.abn ?? null,
        });
      }
    } catch (err) {
      console.error('[useProfile] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, fetchProfile, setProfile };
}
