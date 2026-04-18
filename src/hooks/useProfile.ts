import { useState, useCallback } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { client, type UserProfile } from '../lib/api';

function mapProfile(p: UserProfile): UserProfile {
  return {
    id: p.id,
    email: p.email,
    stripeCustomerId: p.stripeCustomerId ?? null,
    subscriptionProvider: (p as any).subscriptionProvider ?? null,
    subscriptionStatus: p.subscriptionStatus ?? 'inactive',
    subscriptionEndDate: p.subscriptionEndDate ?? null,
    isFoundingMember: p.isFoundingMember ?? false,
    currency: p.currency ?? 'USD',
    businessName: p.businessName ?? null,
    fullName: p.fullName ?? null,
    phone: p.phone ?? null,
    address: p.address ?? null,
    abn: p.abn ?? null,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const load = async () => {
        const result = await client.models.UserProfile.list();
        return result.data?.[0] ?? null;
      };

      let p = await load();

      if (!p) {
        const attributes = await fetchUserAttributes();
        const email = attributes.email;
        if (!email) {
          setProfile(null);
          return null;
        }

        const created = await client.mutations.createUserProfile({ email, currency: 'USD' });
        if (created.data?.error) throw new Error(created.data.error);
        p = await load();
      }

      if (!p) {
        setProfile(null);
        return null;
      }

      const mapped = mapProfile(p);
      setProfile(mapped);
      return mapped;
    } catch (err) {
      console.error('[useProfile] fetch error:', err);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, fetchProfile, setProfile };
}
