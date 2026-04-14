import { useState, useEffect } from 'react';
import { Save, Lock } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { client } from '../lib/api';
import { CURRENCIES } from '../lib/format';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { profile, loading, fetchProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [payidValue, setPayidValue] = useState('');
  const [payidLoading, setPayidLoading] = useState(false);
  const [payidSaving, setPayidSaving] = useState(false);
  const [payidLoaded, setPayidLoaded] = useState(false);

  const [form, setForm] = useState({
    currency: 'USD',
    businessName: '',
    fullName: '',
    phone: '',
    address: '',
    abn: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setForm({
        currency: profile.currency ?? 'USD',
        businessName: profile.businessName ?? '',
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        abn: profile.abn ?? '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await client.models.UserProfile.update({
        id: profile.id,
        currency: form.currency,
        businessName: form.businessName || null,
        fullName: form.fullName || null,
        phone: form.phone || null,
        address: form.address || null,
        abn: form.abn || null,
      });
      await fetchProfile();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const loadPayid = async () => {
    setPayidLoading(true);
    try {
      const result = await client.queries.getDecryptedPayid();
      setPayidValue(result.data?.payid ?? '');
      setPayidLoaded(true);
    } catch {
      toast.error('Failed to load PayID');
    } finally {
      setPayidLoading(false);
    }
  };

  const savePayid = async () => {
    setPayidSaving(true);
    try {
      const result = await client.mutations.updateEncryptedPayid({ payid: payidValue });
      if (result.data?.ok) {
        toast.success('PayID updated');
      } else {
        toast.error(result.data?.error ?? 'Failed to update PayID');
      }
    } catch {
      toast.error('Failed to update PayID');
    } finally {
      setPayidSaving(false);
    }
  };

  if (loading && !profile) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50" value={profile?.email ?? ''} disabled readOnly />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
        </div>

        {/* Business details */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Business details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Business name</label>
              <input
                className="input"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Acme Pty Ltd"
              />
            </div>
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+61 400 000 000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St, Sydney NSW 2000"
              />
            </div>
            <div>
              <label className="label">ABN</label>
              <input
                className="input"
                value={form.abn}
                onChange={(e) => setForm({ ...form, abn: e.target.value })}
                placeholder="12 345 678 901"
              />
            </div>
          </div>
        </div>

        {/* PayID */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-semibold text-gray-900">PayID</h2>
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Encrypted at rest</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your PayID is stored encrypted using AES-256-GCM. It is only decrypted server-side when generating invoice PDFs.
          </p>
          {!payidLoaded ? (
            <button type="button" onClick={loadPayid} disabled={payidLoading} className="btn-secondary">
              {payidLoading ? <><LoadingSpinner size="sm" /> Loading…</> : 'View / edit PayID'}
            </button>
          ) : (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="label">PayID</label>
                <input
                  className="input"
                  value={payidValue}
                  onChange={(e) => setPayidValue(e.target.value)}
                  placeholder="your@payid.com or +61 400 000 000"
                />
              </div>
              <button type="button" onClick={savePayid} disabled={payidSaving} className="btn-secondary">
                {payidSaving ? 'Saving…' : 'Save PayID'}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : <><Save className="w-4 h-4" /> Save settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}
